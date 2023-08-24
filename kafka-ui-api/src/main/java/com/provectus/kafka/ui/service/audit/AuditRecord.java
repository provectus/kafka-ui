package com.provectus.kafka.ui.service.audit;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.provectus.kafka.ui.exception.CustomBaseException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.Resource;
import com.provectus.kafka.ui.model.rbac.permission.PermissibleAction;
import java.util.Collection;
import java.util.List;
import javax.annotation.Nullable;
import lombok.SneakyThrows;
import org.springframework.security.access.AccessDeniedException;

record AuditRecord(String timestamp,
                   String username,
                   String clusterName,
                   List<AuditResource> resources,
                   String operation,
                   Object operationParams,
                   OperationResult result) {

  static final JsonMapper MAPPER = new JsonMapper();

  static {
    MAPPER.setSerializationInclusion(JsonInclude.Include.NON_NULL);
  }

  @SneakyThrows
  String toJson() {
    return MAPPER.writeValueAsString(this);
  }

  record AuditResource(Resource type, @Nullable Object id, boolean alter, List<String> accessType) {

    private static AuditResource create(Collection<PermissibleAction> actions, Resource type, @Nullable Object id) {
      boolean isAlter = actions.stream().anyMatch(PermissibleAction::isAlter);
      return new AuditResource(type, id, isAlter, actions.stream().map(PermissibleAction::name).toList());
    }

    static List<AuditResource> getAccessedResources(AccessContext ctx) {
      return ctx.accesses().stream()
          .map(r -> create(r.requestedActions(), r.resourceType(), r.resourceId()))
          .toList();
    }
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
