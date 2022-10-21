package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.AccessApi;
import com.provectus.kafka.ui.model.UserPermissionDTO;
import com.provectus.kafka.ui.model.rbac.Permission;
import com.provectus.kafka.ui.model.rbac.Role;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.Collection;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class AccessController implements AccessApi {

  private final AccessControlService accessControlService;

  public Mono<ResponseEntity<Flux<UserPermissionDTO>>> getPermissions(ServerWebExchange exchange) {
    Flux<UserPermissionDTO> perms = accessControlService.getCachedUser()
        .map(user -> accessControlService.getRoles()
            .stream()
            .filter(role -> user.getGroups().contains(role.getName()))
            .map(Role::getPermissions)
            .flatMap(Collection::stream)
            .map(this::mapPermission)
            .collect(Collectors.toSet()))
        .flatMapMany(Flux::fromIterable);

    return Mono.just(ResponseEntity.ok(perms));
  }

  public Mono<ResponseEntity<Void>> evictCache(ServerWebExchange exchange) {
    accessControlService.evictCache();
    return Mono.just(ResponseEntity.ok().build());
  }

  private UserPermissionDTO mapPermission(Permission permission) {
    UserPermissionDTO dto = new UserPermissionDTO();
    dto.setResource(permission.getResource());
    dto.setValue(permission.getName());
    dto.setActions(permission.getActions());
    return dto;
  }

}
