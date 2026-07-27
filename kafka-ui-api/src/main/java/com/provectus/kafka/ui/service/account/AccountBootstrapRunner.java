package com.provectus.kafka.ui.service.account;

import com.provectus.kafka.ui.config.auth.LoginFormProperties;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(value = "auth.login-form.user-management.enabled", havingValue = "true")
@Slf4j
public class AccountBootstrapRunner implements ApplicationRunner {

  private static final String DEFAULT_ADMIN_USERNAME = "admin";

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final LoginFormProperties loginFormProperties;

  @Override
  public void run(ApplicationArguments args) {
    userRepository.count()
        .filter(count -> count == 0)
        .flatMap(count -> createInitialAdmin())
        .subscribe();
  }

  private Mono<UserEntity> createInitialAdmin() {
    String password = loginFormProperties.getUserManagement().getInitialAdminPassword();
    if (password == null || password.isBlank()) {
      password = UUID.randomUUID().toString();
      log.info("Generated initial password for user '{}': {}", DEFAULT_ADMIN_USERNAME, password);
    }
    var now = LocalDateTime.now();
    var entity = UserEntity.builder()
        .username(DEFAULT_ADMIN_USERNAME)
        .passwordHash(passwordEncoder.encode(password))
        .enabled(true)
        .createdAt(now)
        .updatedAt(now)
        .build();
    return userRepository.save(entity)
        .doOnNext(saved -> log.info("Created initial admin account '{}'", saved.getUsername()));
  }

}
