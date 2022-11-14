package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.AccessApi;
import com.provectus.kafka.ui.model.ActionDTO;
import com.provectus.kafka.ui.model.UserPermissionDTO;
import com.provectus.kafka.ui.model.rbac.Permission;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.Collection;
import java.util.List;
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

  public Mono<ResponseEntity<Flux<UserPermissionDTO>>> getUserPermissions(ServerWebExchange exchange) {
    Flux<UserPermissionDTO> perms = accessControlService.getCachedUser()
        .map(user -> accessControlService.getRoles()
                .stream()
                .filter(role -> user.getGroups().contains(role.getName()))
                .map(role -> mapPermissions(role.getPermissions(), role.getClusters()))
                .flatMap(Collection::stream)
                .collect(Collectors.toList())
        )
        .flatMapMany(Flux::fromIterable);

    return Mono.just(ResponseEntity.ok(perms));
  }

  public Mono<ResponseEntity<Void>> evictRolesCache(ServerWebExchange exchange) {
    accessControlService.evictCache();
    return Mono.just(ResponseEntity.ok().build());
  }

  public Mono<ResponseEntity<Void>> reloadRoles(ServerWebExchange exchange) {
    accessControlService.reloadRoles();
    return Mono.just(ResponseEntity.ok().build());
  }

  private List<UserPermissionDTO> mapPermissions(List<Permission> permissions, List<String> clusters) {
    return permissions
        .stream()
        .map(permission -> {
          UserPermissionDTO dto = new UserPermissionDTO();
          dto.setClusters(clusters);
          dto.setResource(UserPermissionDTO.ResourceEnum.fromValue(permission.getResource().toString().toUpperCase()));
          dto.setValue(permission.getValue() != null ? permission.getValue().toString() : null);
          dto.setActions(permission.getActions()
              .stream()
              .map(String::toUpperCase)
              .map(ActionDTO::valueOf)
              .collect(Collectors.toList()));
          return dto;
        })
        .collect(Collectors.toList());
  }

}
