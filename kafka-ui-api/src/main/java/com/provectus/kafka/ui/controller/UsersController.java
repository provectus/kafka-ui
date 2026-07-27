package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.UsersApi;
import com.provectus.kafka.ui.mapper.AccountMapper;
import com.provectus.kafka.ui.model.CreateUserDTO;
import com.provectus.kafka.ui.model.UpdateUserDTO;
import com.provectus.kafka.ui.model.UserDTO;
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
public class UsersController extends AbstractController implements UsersApi {

  private final AccountService accountService;

  @Override
  public Mono<ResponseEntity<Flux<UserDTO>>> listUsers(ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .usersActions(UsersAction.VIEW)
        .operationName("listUsers")
        .build();

    return validateAccess(context).then(
        Mono.just(ResponseEntity.ok(accountService.listAccounts().map(AccountMapper::toDto)))
    ).doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<UserDTO>> createUser(Mono<CreateUserDTO> createUserDto, ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .usersActions(UsersAction.EDIT)
        .operationName("createUser")
        .build();

    return validateAccess(context)
        .then(createUserDto)
        .flatMap(dto -> accountService.createAccount(dto.getUsername(), dto.getPassword(), dto.getRoles()))
        .map(AccountMapper::toDto)
        .map(ResponseEntity::ok)
        .doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<UserDTO>> updateUser(Long id, Mono<UpdateUserDTO> updateUserDto,
                                                  ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .usersActions(UsersAction.EDIT)
        .operationName("updateUser")
        .build();

    return validateAccess(context)
        .then(updateUserDto)
        .flatMap(dto -> accountService.updateAccount(id, dto.getPassword(), dto.getRoles(), dto.getEnabled()))
        .map(AccountMapper::toDto)
        .map(ResponseEntity::ok)
        .doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteUser(Long id, ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .usersActions(UsersAction.EDIT)
        .operationName("deleteUser")
        .build();

    return validateAccess(context)
        .then(accountService.deleteAccount(id))
        .doOnEach(sig -> audit(context, sig))
        .thenReturn(ResponseEntity.ok().build());
  }

}
