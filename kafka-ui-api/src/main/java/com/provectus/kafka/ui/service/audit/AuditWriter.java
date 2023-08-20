package com.provectus.kafka.ui.service.audit;

import static java.nio.charset.StandardCharsets.UTF_8;

import com.provectus.kafka.ui.config.auth.AuthenticatedUser;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.service.audit.AuditRecord.AuditResource;
import com.provectus.kafka.ui.service.audit.AuditRecord.OperationResult;
import java.io.Closeable;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import javax.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;

@Slf4j
record AuditWriter(String clusterName,
                   boolean logAlterOperationsOnly,
                   @Nullable String targetTopic,
                   @Nullable KafkaProducer<byte[], byte[]> producer,
                   @Nullable Logger consoleLogger) implements Closeable {

  boolean isTopicWritingEnabled() {
    return producer != null;
  }

  // application-level (cluster-independent) operation
  static void writeAppOperation(Logger consoleLogger,
                                AccessContext ctx,
                                AuthenticatedUser user,
                                @Nullable Throwable th) {
    consoleLogger.info(createRecord(ctx, user, th).toJson());
  }

  void write(AccessContext ctx, AuthenticatedUser user, @Nullable Throwable th) {
    write(createRecord(ctx, user, th));
  }

  private void write(AuditRecord rec) {
    if (logAlterOperationsOnly && rec.resources().stream().noneMatch(AuditResource::alter)) {
      //we should only log alter operations, but this is read-only op
      return;
    }
    String json = rec.toJson();
    if (consoleLogger != null) {
      consoleLogger.info(json);
    }
    if (targetTopic != null && producer != null) {
      producer.send(
          new ProducerRecord<>(targetTopic, null, json.getBytes(UTF_8)),
          (metadata, ex) -> {
            if (ex != null) {
              log.warn("Error sending Audit record to kafka for cluster {}", clusterName, ex);
            }
          });
    }
  }

  private static AuditRecord createRecord(AccessContext ctx,
                                          AuthenticatedUser user,
                                          @Nullable Throwable th) {
    return new AuditRecord(
        DateTimeFormatter.ISO_INSTANT.format(Instant.now()),
        user.principal(),
        ctx.getCluster(), //can be null, if it is application-level action
        AuditResource.getAccessedResources(ctx),
        ctx.getOperationName(),
        ctx.getOperationParams(),
        th == null ? OperationResult.successful() : OperationResult.error(th)
    );
  }

  @Override
  public void close() {
    Optional.ofNullable(producer).ifPresent(KafkaProducer::close);
  }

}


