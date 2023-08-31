package com.provectus.kafka.ui.service.audit;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.provectus.kafka.ui.exception.CustomBaseException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.Resource;
import com.provectus.kafka.ui.model.rbac.permission.PermissibleAction;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

  record AuditResource(String accessType, boolean alter, Resource type, @Nullable Object id) {

    private static AuditResource create(PermissibleAction action, Resource type, @Nullable Object id) {
      return new AuditResource(action.name(), action.isAlter(), type, id);
    }

    static List<AuditResource> getAccessedResources(AccessContext ctx) {
      List<AuditResource> resources = new ArrayList<>();
      ctx.getClusterConfigActions()
          .forEach(a -> resources.add(create(a, Resource.CLUSTERCONFIG, null)));
      ctx.getTopicActions()
          .forEach(a -> resources.add(create(a, Resource.TOPIC, nameId(ctx.getTopic()))));
      ctx.getConsumerGroupActions()
          .forEach(a -> resources.add(create(a, Resource.CONSUMER, nameId(ctx.getConsumerGroup()))));
      ctx.getConnectActions()
          .forEach(a -> {
            Map<String, String> resourceId = new LinkedHashMap<>();
            resourceId.put("connect", ctx.getConnect());
            if (ctx.getConnector() != null) {
              resourceId.put("connector", ctx.getConnector());
            }
            resources.add(create(a, Resource.CONNECT, resourceId));
          });
      ctx.getSchemaActions()
          .forEach(a -> resources.add(create(a, Resource.SCHEMA, nameId(ctx.getSchema()))));
      ctx.getKsqlActions()
          .forEach(a -> resources.add(create(a, Resource.KSQL, null)));
      ctx.getAclActions()
          .forEach(a -> resources.add(create(a, Resource.ACL, null)));
      ctx.getAuditAction()
          .forEach(a -> resources.add(create(a, Resource.AUDIT, null)));
      return resources;
    }

    @Nullable
    private static Map<String, Object> nameId(@Nullable String name) {
      return name != null ? Map.of("name", name) : null;
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
