package com.provectus.kafka.ui.service.audit;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.config.auth.AuthenticatedUser;
import com.provectus.kafka.ui.exception.CustomBaseException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.Resource;
import com.provectus.kafka.ui.model.rbac.permission.PermissibleAction;
import com.provectus.kafka.ui.service.AdminClientService;
import com.provectus.kafka.ui.service.ClustersStorage;
import com.provectus.kafka.ui.service.MessagesService;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.io.Closeable;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService implements Closeable {

  private static final Logger AUDIT_LOGGER = LoggerFactory.getLogger("audit");

  private static final String DEFAULT_AUDIT_TOPIC_NAME = "__kui-audit-log ";
  private static final int DEFAULT_AUDIT_TOPIC_PARTITIONS = 1;
  private static final Map<String, String> DEFAULT_AUDIT_TOPIC_PROPERTIES = Map.of(
      "retention.ms", String.valueOf(TimeUnit.DAYS.toMillis(7)),
      "cleanup.policy", "delete",
      "compression.type", "gzip"
  );


  private final Map<String, AuditWriter> auditWriters = new ConcurrentHashMap<>();

  private final ClustersStorage clustersStorage;

  public AuditService(ClustersProperties clustersProperties,
                      MessagesService messagesService,
                      AdminClientService adminClientService,
                      ClustersStorage clustersStorage) {
    this.clustersStorage = clustersStorage;
    if (clustersProperties.getClusters() != null) {
      for (var clusterProps : clustersProperties.getClusters()) {
        createTopicAndProducer(
            adminClientService,
            clustersStorage.getClusterByName(clusterProps.getName()).orElseThrow(),
            messagesService
        );
      }
    }
  }

  public void sendAuditRecord(AccessContext ctx, AuthenticatedUser user) {
    if (ctx.getCluster() != null) {
      if (auditWriters.containsKey(ctx.getCluster())) {
        auditWriters.get(ctx.getCluster()).write(ctx, user);
      }
    } else {
      //TODO: app config change
    }
  }

  public void sendAuditRecord(AccessContext ctx, AuthenticatedUser user, Throwable th) {
    if (ctx.getCluster() != null) {
      if (auditWriters.containsKey(ctx.getCluster())) {
        auditWriters.get(ctx.getCluster()).write(ctx, user, th);
      }
    } else {
      //TODO: app config change
    }
  }

  private void createTopicAndProducer(KafkaCluster c,
                                      ReactiveAdminClient ac,
                                      MessagesService ms) {
    var props = c.getOriginalProperties();
    if (props.getAudit() != null) {

    }
  }

  @Override
  public void close() throws IOException {

  }
}
