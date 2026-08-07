package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.RolesApi;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.UsersAction;
import com.provectus.kafka.ui.service.account.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@ConditionalOnProperty(value = "auth.login-form.user-management.enabled", havingValue = "true")
public class RolesController extends AbstractController implements RolesApi {

  private final AccountService accountService;

  @Override
  public Mono<ResponseEntity<Flux<String>>> listRoles(ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .usersActions(UsersAction.VIEW)
        .operationName("listRoles")
        .build();

    return validateAccess(context).then(
        Mono.just(ResponseEntity.ok(Flux.fromIterable(accountService.listAssignableRoleNames())))
    ).doOnEach(sig -> audit(context, sig));
  }

}
