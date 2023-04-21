package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.AuthorizationApi;
import com.provectus.kafka.ui.model.ActionDTO;
import com.provectus.kafka.ui.model.AuthenticationInfoDTO;
import com.provectus.kafka.ui.model.ResourceTypeDTO;
import com.provectus.kafka.ui.model.UserInfoDTO;
import com.provectus.kafka.ui.model.UserPermissionDTO;
import com.provectus.kafka.ui.model.rbac.Permission;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.security.Principal;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class AccessController implements AuthorizationApi {

  private final AccessControlService accessControlService;

  public Mono<ResponseEntity<AuthenticationInfoDTO>> getUserAuthInfo(ServerWebExchange exchange) {
    AuthenticationInfoDTO dto = new AuthenticationInfoDTO();
    dto.setRbacEnabled(accessControlService.isRbacEnabled());
    UserInfoDTO userInfo = new UserInfoDTO();

    Mono<List<UserPermissionDTO>> permissions = accessControlService.getUser()
        .map(user -> accessControlService.getRoles()
            .stream()
            .filter(role -> user.groups().contains(role.getName()))
            .map(role -> mapPermissions(role.getPermissions(), role.getClusters()))
            .flatMap(Collection::stream)
            .collect(Collectors.toList())
        )
        .switchIfEmpty(Mono.just(Collections.emptyList()));

    Mono<String> userName = ReactiveSecurityContextHolder.getContext()
        .map(SecurityContext::getAuthentication)
        .map(Principal::getName);

    return userName
        .zipWith(permissions)
        .map(data -> {
          userInfo.setUsername(data.getT1());
          userInfo.setPermissions(data.getT2());

          dto.setUserInfo(userInfo);
          return dto;
        })
        .switchIfEmpty(Mono.just(dto))
        .map(ResponseEntity::ok);
  }

  private List<UserPermissionDTO> mapPermissions(List<Permission> permissions, List<String> clusters) {
    return permissions
        .stream()
        .map(permission -> {
          UserPermissionDTO dto = new UserPermissionDTO();
          dto.setClusters(clusters);
          dto.setResource(ResourceTypeDTO.fromValue(permission.getResource().toString().toUpperCase()));
          dto.setValue(permission.getValue());
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
