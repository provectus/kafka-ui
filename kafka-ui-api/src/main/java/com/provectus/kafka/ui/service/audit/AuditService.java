package com.provectus.kafka.ui.service.audit;

import static com.provectus.kafka.ui.config.ClustersProperties.AuditProperties.LogLevel.ALTER_ONLY;
import static com.provectus.kafka.ui.service.MessagesService.createProducer;

import com.google.common.annotations.VisibleForTesting;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.config.auth.AuthenticatedUser;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.service.AdminClientService;
import com.provectus.kafka.ui.service.ClustersStorage;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.io.Closeable;
import java.io.IOException;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Signal;


@Slf4j
@Service
public class AuditService implements Closeable {

  private static final Mono<AuthenticatedUser> NO_AUTH_USER = Mono.just(new AuthenticatedUser("Unknown", Set.of()));
  private static final Duration BLOCK_TIMEOUT = Duration.ofSeconds(5);

  private static final String DEFAULT_AUDIT_TOPIC_NAME = "__kui-audit-log";
  private static final int DEFAULT_AUDIT_TOPIC_PARTITIONS = 1;
  private static final Map<String, String> DEFAULT_AUDIT_TOPIC_CONFIG = Map.of(
      "retention.ms", String.valueOf(TimeUnit.DAYS.toMillis(7)),
      "cleanup.policy", "delete"
  );
  private static final Map<String, Object> AUDIT_PRODUCER_CONFIG = Map.of(
      ProducerConfig.COMPRESSION_TYPE_CONFIG, "gzip"
  );

  private static final Logger AUDIT_LOGGER = LoggerFactory.getLogger("audit");

  private final Map<String, AuditWriter> auditWriters;

  @Autowired
  public AuditService(AdminClientService adminClientService, ClustersStorage clustersStorage) {
    Map<String, AuditWriter> auditWriters = new HashMap<>();
    for (var cluster : clustersStorage.getKafkaClusters()) {
      Supplier<ReactiveAdminClient> adminClientSupplier = () -> adminClientService.get(cluster).block(BLOCK_TIMEOUT);
      createAuditWriter(cluster, adminClientSupplier, () -> createProducer(cluster, AUDIT_PRODUCER_CONFIG))
          .ifPresent(writer -> auditWriters.put(cluster.getName(), writer));
    }
    this.auditWriters = auditWriters;
  }

  @VisibleForTesting
  AuditService(Map<String, AuditWriter> auditWriters) {
    this.auditWriters = auditWriters;
  }

  @VisibleForTesting
  static Optional<AuditWriter> createAuditWriter(KafkaCluster cluster,
                                                 Supplier<ReactiveAdminClient> acSupplier,
                                                 Supplier<KafkaProducer<byte[], byte[]>> producerFactory) {
    var auditProps = cluster.getOriginalProperties().getAudit();
    if (auditProps == null) {
      return Optional.empty();
    }
    boolean topicAudit = Optional.ofNullable(auditProps.getTopicAuditEnabled()).orElse(false);
    boolean consoleAudit = Optional.ofNullable(auditProps.getConsoleAuditEnabled()).orElse(false);
    boolean alterLogOnly = Optional.ofNullable(auditProps.getLevel()).map(lvl -> lvl == ALTER_ONLY).orElse(true);
    if (!topicAudit && !consoleAudit) {
      return Optional.empty();
    }
    if (!topicAudit) {
      log.info("Audit initialization finished for cluster '{}' (console only)", cluster.getName());
      return Optional.of(consoleOnlyWriter(cluster, alterLogOnly));
    }
    String auditTopicName = Optional.ofNullable(auditProps.getTopic()).orElse(DEFAULT_AUDIT_TOPIC_NAME);
    boolean topicAuditCanBeDone = createTopicIfNeeded(cluster, acSupplier, auditTopicName, auditProps);
    if (!topicAuditCanBeDone) {
      if (consoleAudit) {
        log.info(
            "Audit initialization finished for cluster '{}' (console only, topic audit init failed)",
            cluster.getName()
        );
        return Optional.of(consoleOnlyWriter(cluster, alterLogOnly));
      }
      return Optional.empty();
    }
    log.info("Audit initialization finished for cluster '{}'", cluster.getName());
    return Optional.of(
        new AuditWriter(
            cluster.getName(),
            alterLogOnly,
            auditTopicName,
            producerFactory.get(),
            consoleAudit ? AUDIT_LOGGER : null
        )
    );
  }

  private static AuditWriter consoleOnlyWriter(KafkaCluster cluster, boolean alterLogOnly) {
    return new AuditWriter(cluster.getName(), alterLogOnly, null, null, AUDIT_LOGGER);
  }

  /**
   * return true if topic created/existing and producing can be enabled.
   */
  private static boolean createTopicIfNeeded(KafkaCluster cluster,
                                             Supplier<ReactiveAdminClient> acSupplier,
                                             String auditTopicName,
                                             ClustersProperties.AuditProperties auditProps) {
    ReactiveAdminClient ac;
    try {
      ac = acSupplier.get();
    } catch (Exception e) {
      printAuditInitError(cluster, "Error while connecting to the cluster", e);
      return false;
    }
    boolean topicExists;
    try {
      topicExists = ac.listTopics(true).block(BLOCK_TIMEOUT).contains(auditTopicName);
    } catch (Exception e) {
      printAuditInitError(cluster, "Error checking audit topic existence", e);
      return false;
    }
    if (topicExists) {
      return true;
    }
    try {
      int topicPartitions =
          Optional.ofNullable(auditProps.getAuditTopicsPartitions())
              .orElse(DEFAULT_AUDIT_TOPIC_PARTITIONS);

      Map<String, String> topicConfig = new HashMap<>(DEFAULT_AUDIT_TOPIC_CONFIG);
      Optional.ofNullable(auditProps.getAuditTopicProperties())
          .ifPresent(topicConfig::putAll);

      log.info("Creating audit topic '{}' for cluster '{}'", auditTopicName, cluster.getName());
      ac.createTopic(auditTopicName, topicPartitions, null, topicConfig).block(BLOCK_TIMEOUT);
      log.info("Audit topic created for cluster '{}'", cluster.getName());
      return true;
    } catch (Exception e) {
      printAuditInitError(cluster, "Error creating topic '%s'".formatted(auditTopicName), e);
      return false;
    }
  }

  private static void printAuditInitError(KafkaCluster cluster, String errorMsg, Exception cause) {
    log.error("-----------------------------------------------------------------");
    log.error(
        "Error initializing Audit for cluster '{}'. Audit will be disabled. See error below: ",
        cluster.getName()
    );
    log.error("{}", errorMsg, cause);
    log.error("-----------------------------------------------------------------");
  }

  public boolean isAuditTopic(KafkaCluster cluster, String topic) {
    var writer = auditWriters.get(cluster.getName());
    return writer != null
        && topic.equals(writer.targetTopic())
        && writer.isTopicWritingEnabled();
  }

  public void audit(AccessContext acxt, Signal<?> sig) {
    if (sig.isOnComplete()) {
      extractUser(sig)
          .doOnNext(u -> sendAuditRecord(acxt, u))
          .subscribe();
    } else if (sig.isOnError()) {
      extractUser(sig)
          .doOnNext(u -> sendAuditRecord(acxt, u, sig.getThrowable()))
          .subscribe();
    }
  }

  private Mono<AuthenticatedUser> extractUser(Signal<?> sig) {
    //see ReactiveSecurityContextHolder for impl details
    Object key = SecurityContext.class;
    if (sig.getContextView().hasKey(key)) {
      return sig.getContextView().<Mono<SecurityContext>>get(key)
          .map(context -> context.getAuthentication().getPrincipal())
          .cast(UserDetails.class)
          .map(user -> {
            var roles = user.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toSet());
            return new AuthenticatedUser(user.getUsername(), roles);
          })
          .switchIfEmpty(NO_AUTH_USER);
    } else {
      return NO_AUTH_USER;
    }
  }

  private void sendAuditRecord(AccessContext ctx, AuthenticatedUser user) {
    sendAuditRecord(ctx, user, null);
  }

  private void sendAuditRecord(AccessContext ctx, AuthenticatedUser user, @Nullable Throwable th) {
    try {
      if (ctx.getCluster() != null) {
        var writer = auditWriters.get(ctx.getCluster());
        if (writer != null) {
          writer.write(ctx, user, th);
        }
      } else {
        // cluster-independent operation
        AuditWriter.writeAppOperation(AUDIT_LOGGER, ctx, user, th);
      }
    } catch (Exception e) {
      log.warn("Error sending audit record", e);
    }
  }

  @Override
  public void close() throws IOException {
    auditWriters.values().forEach(AuditWriter::close);
  }
}
