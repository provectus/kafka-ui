package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.model.rbac.Role;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.Collection;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class AccessController {

  private final AccessControlService accessControlService;

  @Autowired
  public AccessController(AccessControlService accessControlService) {
    this.accessControlService = accessControlService;
  }

  @RequestMapping("/getPermissions")
  public Mono<Collection<String>> getPermissions() {
    return accessControlService.getCachedUser()
        .map(user -> accessControlService.getRoles()
            .stream()
            .filter(role -> user.getGroups().contains(role.getName()))
            .map(Role::getPermissions)
            .flatMap(Collection::stream)
            .filter(perm -> ".*".equals(perm.getName()))
            .map(perm -> perm.getResource()  + ":" + String.join(",", perm.getActions()))
            .distinct()
            .collect(Collectors.toList()));
  }

}
