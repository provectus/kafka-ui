package com.provectus.kafka.ui.service.audit;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.provectus.kafka.ui.config.auth.AuthenticatedUser;
import com.provectus.kafka.ui.exception.CustomBaseException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.Resource;
import com.provectus.kafka.ui.model.rbac.permission.PermissibleAction;
import com.provectus.kafka.ui.service.AdminClientService;
import com.provectus.kafka.ui.service.MessagesService;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.nio.charset.StandardCharsets;
import lombok.SneakyThrows;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.springframework.security.access.AccessDeniedException;

record AuditWriter(String targetTopic,
                   ReactiveAdminClient adminClient,
                   KafkaProducer<byte[], byte[]> producer,
                   boolean logToConsole) {

  static AuditWriter createAndInit(KafkaCluster c,
                                   ReactiveAdminClient ac,
                                   MessagesService ms) {

  }

  public void write(AccessContext ctx, AuthenticatedUser user) {

  }

  public void write(AccessContext ctx, AuthenticatedUser user, Throwable th) {

  }


  record AuditRecord(String timestamp,
                     String userPrincipal, //TODO: discuss - rename to username?
                     String clusterName,
                     AuditResource resources,
                     String operation,
                     OperationResult result,
                     Object params
  ) {
    static final JsonMapper MAPPER = new JsonMapper();

    @SneakyThrows
    byte[] toJson() {
      return MAPPER.writeValueAsString(this).getBytes(StandardCharsets.UTF_8);
    }
  }

  record AuditResource(PermissibleAction accessType, Resource type, Object id) {
  }

  record OperationResult(boolean success, OperationError error) {
  }

  static OperationResult successResult() {
    return new OperationResult(true, null);
  }

  static OperationResult errorResult(Throwable th) {
    OperationError err = OperationError.UNEXPECTED_ERROR;
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
    UNEXPECTED_ERROR
  }

}


