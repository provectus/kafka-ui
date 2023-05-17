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
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import javax.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AuditService implements Closeable {

  private static final String DEFAULT_AUDIT_TOPIC_NAME = "__kui-audit-log";
  private static final int DEFAULT_AUDIT_TOPIC_PARTITIONS = 1;
  private static final Map<String, String> DEFAULT_AUDIT_TOPIC_CONFIG = Map.of(
      "retention.ms", String.valueOf(TimeUnit.DAYS.toMillis(7)),
      "cleanup.policy", "delete"
  );
  private static final Map<String, Object> AUDIT_PRODUCER_CONFIG = Map.of(
      ProducerConfig.COMPRESSION_TYPE_CONFIG, "gzip"
  );

  private final Map<String, AuditWriter> auditWriters = new HashMap<>();

  public AuditService(ClustersProperties clustersProperties,
                      AdminClientService adminClientService,
                      ClustersStorage clustersStorage) {
    for (var clusterProps : Optional.ofNullable(clustersProperties.getClusters()).orElse(List.of())) {
      var cluster = clustersStorage.getClusterByName(clusterProps.getName()).orElseThrow();
      ReactiveAdminClient adminClient;
      try {
        adminClient = adminClientService.get(cluster).block();
      } catch (Exception e) {
        printAuditInitError(cluster, "Error connect to cluster", e);
        continue;
      }
      initialize(cluster, adminClient);
    }
  }

  private void initialize(KafkaCluster cluster, ReactiveAdminClient ac) {
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
    @Nullable KafkaProducer<byte[], byte[]> producer = null;
    if (topicAudit && createTopicIfNeeded(cluster, ac, auditTopicName, auditProps)) {
      producer = MessagesService.createProducer(cluster, AUDIT_PRODUCER_CONFIG);
    }
    auditWriters.put(cluster.getName(), new AuditWriter(auditTopicName, producer, consoleAudit));
    log.info("Audit service initialized for cluster '{}'", cluster.getName());
  }

  /**
   * @return true if topic created/existing and producing can be enabled
   */
  private boolean createTopicIfNeeded(KafkaCluster cluster,
                                      ReactiveAdminClient ac,
                                      String auditTopicName,
                                      ClustersProperties.AuditProperties auditProps) {
    boolean topicExists;
    try {
      topicExists = ac.listTopics(false).block().contains(auditTopicName);
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

  private void printAuditInitError(KafkaCluster cluster, String errorMsg, Exception cause) {
    log.error("-----------------------------------------------------------------");
    log.error(
        "Error initializing Audit Service for cluster '{}'. Audit will be disabled. See error below: ",
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
