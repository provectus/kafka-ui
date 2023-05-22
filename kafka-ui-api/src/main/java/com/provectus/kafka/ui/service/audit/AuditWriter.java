package com.provectus.kafka.ui.service.audit;

import com.provectus.kafka.ui.config.auth.AuthenticatedUser;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.service.audit.AuditRecord.AuditResource;
import com.provectus.kafka.ui.service.audit.AuditRecord.OperationResult;
import java.io.Closeable;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import javax.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Slf4j
record AuditWriter(String clusterName,
                   String targetTopic,
                   @Nullable KafkaProducer<byte[], byte[]> producer,
                   boolean logToConsole) implements Closeable {

  //TODO: discuss AUDIT LOG FORMAT and name
  private static final Logger AUDIT_LOGGER = LoggerFactory.getLogger("audit");

  public void write(AccessContext ctx, AuthenticatedUser user, @Nullable Throwable th) {
    write(
        new AuditRecord(
            DateTimeFormatter.ISO_INSTANT.format(Instant.now()),
            user.principal(),
            clusterName,
            AuditResource.getAccessedResources(ctx),
            ctx.getOperationName(),
            ctx.getOperationParams(),
            th == null ? OperationResult.successful() : OperationResult.error(th)
        )
    );
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
            if (ex != null) {
              log.warn("Error sending Audit record to kafka for cluster {}", clusterName, ex);
            }
          });
    }
  }

  @Override
  public void close() {
    Optional.ofNullable(producer).ifPresent(KafkaProducer::close);
  }

}


