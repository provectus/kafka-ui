package com.provectus.kafka.ui.service.audit;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.provectus.kafka.ui.config.auth.AuthenticatedUser;
import com.provectus.kafka.ui.exception.CustomBaseException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.Resource;
import com.provectus.kafka.ui.model.rbac.permission.PermissibleAction;
import java.io.Closeable;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.annotation.Nullable;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;

@Slf4j
record AuditWriter(String targetTopic,
                   @Nullable KafkaProducer<byte[], byte[]> producer,
                   boolean logToConsole) implements Closeable {

  //TODO: discuss AUDIT LOG FORMAT and name
  private static final Logger AUDIT_LOGGER = LoggerFactory.getLogger("audit");

  public void write(AccessContext ctx, AuthenticatedUser user, @Nullable Throwable th) {
    write(
        new AuditRecord(
            DateTimeFormatter.ISO_INSTANT.format(Instant.now()),
            user.principal(),
            ctx.getCluster(),
            getAccessedResources(ctx),
            ctx.getOperationDescription(),
            th == null ? OperationResult.successful() : OperationResult.error(th),
            ctx.getOperationParams()
        )
    );
  }

  private List<AuditResource> getAccessedResources(AccessContext ctx) {
    List<AuditResource> resources = new ArrayList<>();
    ctx.getClusterConfigActions()
        .forEach(a -> resources.add(new AuditResource(a, Resource.CLUSTERCONFIG, null)));
    ctx.getTopicActions()
        .forEach(a -> resources.add(new AuditResource(a, Resource.TOPIC, nameId(ctx.getTopic()))));
    ctx.getConsumerGroupActions()
        .forEach(a -> resources.add(new AuditResource(a, Resource.CONSUMER, nameId(ctx.getConsumerGroup()))));
    ctx.getConnectActions()
        .forEach(a -> resources.add(new AuditResource(a, Resource.CONNECT, nameId(ctx.getConnect()))));
    ctx.getSchemaActions()
        .forEach(a -> resources.add(new AuditResource(a, Resource.SCHEMA, nameId(ctx.getSchema()))));
    ctx.getKsqlActions()
        .forEach(a -> resources.add(new AuditResource(a, Resource.KSQL, null)));
    ctx.getAclActions()
        .forEach(a -> resources.add(new AuditResource(a, Resource.ACL, null)));
    return resources;
  }

  @Nullable
  private Map<String, Object> nameId(@Nullable String name) {
    return name != null ? Map.of("name", name) : null;
  }

  private void write(AuditRecord rec) {
    String json = rec.toJson();
    if (logToConsole) {
      AUDIT_LOGGER.info(json);
    }
    if (producer != null) {
      producer.send(
          new ProducerRecord<>(targetTopic, null, json.getBytes(StandardCharsets.UTF_8)),
          (metadata, ex) -> {
            log.warn("Error writing Audit record", ex);
          });
    }
  }

  @Override
  public void close() {
    Optional.ofNullable(producer).ifPresent(KafkaProducer::close);
  }

  record AuditRecord(String timestamp,
                     String userPrincipal,  //TODO: discuss - rename to username?
                     String clusterName,
                     List<AuditResource> resources,
                     String operation,
                     OperationResult result,
                     @Nullable Object params) {

    //TODO: do not render null
    static final JsonMapper MAPPER = new JsonMapper();

    @SneakyThrows
    String toJson() {
      return MAPPER.writeValueAsString(this);
    }
  }

  record AuditResource(PermissibleAction accessType, Resource type, @Nullable Object id) {
  }

  record OperationResult(boolean success, OperationError error) {

    static OperationResult successful() {
      return new OperationResult(true, null);
    }

    static OperationResult error(Throwable th) {
      OperationError err = OperationError.UNRECOGNIZED_ERROR;
      if (th instanceof AccessDeniedException) {
        err = OperationError.ACCESS_DENIED;
      } else if (th instanceof ValidationException) {
        err = OperationError.VALIDATION_ERROR;
      } else if (th instanceof CustomBaseException) {
        err = OperationError.EXECUTION_ERROR;
      }
      return new OperationResult(false, err);
    }

    enum OperationError {
      ACCESS_DENIED,
      VALIDATION_ERROR,
      EXECUTION_ERROR,
      UNRECOGNIZED_ERROR
    }
  }

}


