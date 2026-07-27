package com.provectus.kafka.ui.config.auth;

import com.provectus.kafka.ui.service.account.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@ConditionalOnProperty(value = "auth.login-form.user-management.enabled", havingValue = "true")
@EnableR2dbcRepositories(basePackageClasses = UserRepository.class)
@EnableConfigurationProperties(LoginFormProperties.class)
@Slf4j
public class AccountStorageConfig {

  public AccountStorageConfig() {
    log.info("DB-backed multi-user account management is enabled (auth.login-form.user-management.enabled=true).");
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

}
