package com.provectus.kafka.ui.service.audit;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.config.auth.AuthenticatedUser;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.service.AdminClientService;
import com.provectus.kafka.ui.service.ClustersStorage;
import com.provectus.kafka.ui.service.MessagesService;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.io.Closeable;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import javax.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AuditService implements Closeable {

  private static final String DEFAULT_AUDIT_TOPIC_NAME = "__kui-audit-log";
  private static final int DEFAULT_AUDIT_TOPIC_PARTITIONS = 1;
  private static final Map<String, String> DEFAULT_AUDIT_TOPIC_PROPERTIES = Map.of(
      "retention.ms", String.valueOf(TimeUnit.DAYS.toMillis(7)),
      "cleanup.policy", "delete",
      "compression.type", "gzip"
  );

  private final Map<String, AuditWriter> auditWriters = new ConcurrentHashMap<>();

  public AuditService(ClustersProperties clustersProperties,
                      MessagesService messagesService,
                      AdminClientService adminClientService,
                      ClustersStorage clustersStorage) {
    if (clustersProperties.getClusters() != null) {
      for (var clusterProps : clustersProperties.getClusters()) {
        var cluster = clustersStorage.getClusterByName(clusterProps.getName()).orElseThrow();
        initialize(
            cluster,
            adminClientService.get(cluster).block(),
            messagesService
        );
      }
    }
  }

  private void initialize(KafkaCluster cluster,
                          ReactiveAdminClient ac,
                          MessagesService messagesService) {
    var auditProps = cluster.getOriginalProperties().getAudit();
    if (auditProps == null) {
      return;
    }
    boolean topicAudit = Optional.ofNullable(auditProps.getTopicAuditEnabled()).orElse(false);
    boolean consoleAudit = Optional.ofNullable(auditProps.getConsoleAuditEnabled()).orElse(false);
    if (!topicAudit && !consoleAudit) {
      return;
    }
    String auditTopicName = Optional.ofNullable(auditProps.getTopic()).orElse(DEFAULT_AUDIT_TOPIC_NAME);
    KafkaProducer<byte[], byte[]> producer = null;
    if (topicAudit && createTopicIfNeeded(cluster, ac, auditTopicName, auditProps)) {
      producer = messagesService.createProducer(cluster, Map.of());
    }
    auditWriters.put(cluster.getName(), new AuditWriter(auditTopicName, producer, consoleAudit));
  }

  /**
   * @return true if topic created/existing and producing can be enabled
   */
  private boolean createTopicIfNeeded(KafkaCluster cluster,
                                      ReactiveAdminClient ac,
                                      String auditTopicName,
                                      ClustersProperties.AuditProperties auditProps) {
    int topicPartitions =
        Optional.ofNullable(auditProps.getAuditTopicsPartitions()).orElse(DEFAULT_AUDIT_TOPIC_PARTITIONS);
    Map<String, String> topicConfig = new HashMap<>(DEFAULT_AUDIT_TOPIC_PROPERTIES);
    Optional.ofNullable(auditProps.getAuditTopicProperties())
        .ifPresent(topicConfig::putAll);

    boolean topicExists;
    try {
      topicExists = ac.listTopics(false).block().contains(auditTopicName);
    } catch (Exception e) {
      printAuditInitError(cluster, "Error checking audit topic existence", e);
      return false;
    }

    if (!topicExists) {
      try {
        log.info("Creating audit topic '{}' for cluster '{}'", auditTopicName, cluster.getName());
        ac.createTopic(auditTopicName, topicPartitions, null, topicConfig).block();
        log.info("Audit topic created for cluster '{}'", cluster.getName());
        return true;
      } catch (Exception e) {
        printAuditInitError(cluster, "Error creating topic '%s'".formatted(auditTopicName), e);
        return false;
      }
    } else {
      return true;
    }
  }

  private void printAuditInitError(KafkaCluster cluster, String errorMsg, Exception cause) {
    log.error("-----------------------------------------------------------------");
    log.error(
        "Error initializing AUDIT Service for cluster '{}'. Audit will be disabled. See error below: ",
        cluster.getName()
    );
    log.error("{}", errorMsg, cause);
    log.error("-----------------------------------------------------------------");
  }

  public void sendAuditRecord(AccessContext ctx, AuthenticatedUser user) {
    sendAuditRecord(ctx, user, null);
  }

  public void sendAuditRecord(AccessContext ctx, AuthenticatedUser user, @Nullable Throwable th) {
    if (ctx.getCluster() != null) {
      var writer = auditWriters.get(ctx.getCluster());
      if (writer != null) {
        writer.write(ctx, user, th);
      }
    } else {
      //TODO: discuss app config - where to log?
    }
  }

  @Override
  public void close() throws IOException {
    auditWriters.values().forEach(AuditWriter::close);
  }
}
