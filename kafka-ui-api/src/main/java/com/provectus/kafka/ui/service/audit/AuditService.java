package com.provectus.kafka.ui.service.audit;

import static com.provectus.kafka.ui.service.MessagesService.*;

import com.google.common.annotations.VisibleForTesting;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.config.auth.AuthenticatedUser;
import com.provectus.kafka.ui.config.auth.RbacUser;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.service.AdminClientService;
import com.provectus.kafka.ui.service.ClustersStorage;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.io.Closeable;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
import javax.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Signal;


@Slf4j
@Service
public class AuditService implements Closeable {

  private static final Mono<AuthenticatedUser> NO_AUTH_USER = Mono.just(new AuthenticatedUser("Unknown", Set.of()));

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
      ReactiveAdminClient adminClient;
      try {
        adminClient = adminClientService.get(cluster).block();
      } catch (Exception e) {
        printAuditInitError(cluster, "Error connect to cluster", e);
        continue;
      }
      createAuditWriter(cluster, adminClient, () -> createProducer(cluster, AUDIT_PRODUCER_CONFIG))
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
                                                 ReactiveAdminClient ac,
                                                 Supplier<KafkaProducer<byte[], byte[]>> producerFactory) {
    var auditProps = cluster.getOriginalProperties().getAudit();
    if (auditProps == null) {
      return Optional.empty();
    }
    boolean topicAudit = Optional.ofNullable(auditProps.getTopicAuditEnabled()).orElse(false);
    boolean consoleAudit = Optional.ofNullable(auditProps.getConsoleAuditEnabled()).orElse(false);
    if (!topicAudit && !consoleAudit) {
      return Optional.empty();
    }
    String auditTopicName = Optional.ofNullable(auditProps.getTopic()).orElse(DEFAULT_AUDIT_TOPIC_NAME);
    @Nullable KafkaProducer<byte[], byte[]> producer = null;
    if (topicAudit && createTopicIfNeeded(cluster, ac, auditTopicName, auditProps)) {
      producer = producerFactory.get();
    }
    log.info("Audit service initialized for cluster '{}'", cluster.getName());
    return Optional.of(
        new AuditWriter(
            cluster.getName(),
            auditTopicName,
            producer,
            consoleAudit ? AUDIT_LOGGER : null
        )
    );
  }

  /**
   * @return true if topic created/existing and producing can be enabled
   */
  private static boolean createTopicIfNeeded(KafkaCluster cluster,
                                             ReactiveAdminClient ac,
                                             String auditTopicName,
                                             ClustersProperties.AuditProperties auditProps) {
    boolean topicExists;
    try {
      topicExists = ac.listTopics(true).block().contains(auditTopicName);
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
      ac.createTopic(auditTopicName, topicPartitions, null, topicConfig).block();
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
        "Error initializing Audit Service for cluster '{}'. Audit will be disabled. See error below: ",
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
          .cast(RbacUser.class)
          .map(user -> new AuthenticatedUser(user.name(), user.groups()))
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
