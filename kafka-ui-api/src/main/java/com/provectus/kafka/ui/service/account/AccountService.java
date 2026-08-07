package com.provectus.kafka.ui.service.account;

import com.provectus.kafka.ui.config.auth.RoleBasedAccessControlProperties;
import com.provectus.kafka.ui.exception.DuplicateEntityException;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.rbac.Role;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.reactive.TransactionalOperator;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(value = "auth.login-form.user-management.enabled", havingValue = "true")
@Slf4j
public class AccountService {

  private final UserRepository userRepository;
  private final UserRoleRepository userRoleRepository;
  private final PasswordEncoder passwordEncoder;
  private final RoleBasedAccessControlProperties rbacProperties;
  private final TransactionalOperator transactionalOperator;

  public Flux<Account> listAccounts() {
    return userRepository.findAll().flatMap(this::toAccount);
  }

  public Mono<Account> getAccount(Long id) {
    return userRepository.findById(id)
        .switchIfEmpty(Mono.error(new NotFoundException("User not found: " + id)))
        .flatMap(this::toAccount);
  }

  public Mono<Account> createAccount(String username, String rawPassword, List<String> roles) {
    validateRoles(roles);
    return transactionalOperator.transactional(
        userRepository.existsByUsername(username)
            .flatMap(exists -> {
              if (exists) {
                return Mono.error(new DuplicateEntityException("User with username " + username + " already exists"));
              }
              var now = LocalDateTime.now();
              var entity = UserEntity.builder()
                  .username(username)
                  .passwordHash(passwordEncoder.encode(rawPassword))
                  .enabled(true)
                  .createdAt(now)
                  .updatedAt(now)
                  .build();
              return userRepository.save(entity)
                  .flatMap(saved -> saveRoles(saved.getId(), roles).thenReturn(saved));
            })
    ).flatMap(this::toAccount);
  }

  public Mono<Account> updateAccount(Long id, String rawPassword, List<String> roles, Boolean enabled) {
    validateRoles(roles);
    return transactionalOperator.transactional(
        userRepository.findById(id)
            .switchIfEmpty(Mono.error(new NotFoundException("User not found: " + id)))
            .flatMap(entity -> {
              if (rawPassword != null && !rawPassword.isBlank()) {
                entity.setPasswordHash(passwordEncoder.encode(rawPassword));
              }
              if (enabled != null) {
                entity.setEnabled(enabled);
              }
              entity.setUpdatedAt(LocalDateTime.now());
              Mono<Void> rolesUpdate = roles != null
                  ? userRoleRepository.deleteByUserId(id).then(saveRoles(id, roles))
                  : Mono.empty();
              return rolesUpdate.then(userRepository.save(entity));
            })
    ).flatMap(this::toAccount);
  }

  public Mono<Void> deleteAccount(Long id) {
    return transactionalOperator.transactional(
        userRepository.count()
            .flatMap(count -> {
              if (count <= 1) {
                return Mono.error(new ValidationException("Cannot delete the last remaining account"));
              }
              return userRoleRepository.deleteByUserId(id).then(userRepository.deleteById(id));
            })
    );
  }

  public List<String> listAssignableRoleNames() {
    return rbacProperties.getRoles().stream().map(Role::getName).collect(Collectors.toList());
  }

  private Mono<Void> saveRoles(Long userId, List<String> roles) {
    if (roles == null || roles.isEmpty()) {
      return Mono.empty();
    }
    return Flux.fromIterable(roles)
        .map(role -> UserRoleEntity.builder().userId(userId).roleName(role).build())
        .flatMap(userRoleRepository::save)
        .then();
  }

  private void validateRoles(List<String> roles) {
    if (roles == null) {
      return;
    }
    Set<String> assignable = new HashSet<>(listAssignableRoleNames());
    for (String role : roles) {
      if (!assignable.contains(role)) {
        throw new ValidationException("Unknown role: " + role);
      }
    }
  }

  private Mono<Account> toAccount(UserEntity entity) {
    return userRoleRepository.findByUserId(entity.getId())
        .map(UserRoleEntity::getRoleName)
        .collectList()
        .map(roles -> new Account(entity.getId(), entity.getUsername(), entity.isEnabled(), roles));
  }

}
