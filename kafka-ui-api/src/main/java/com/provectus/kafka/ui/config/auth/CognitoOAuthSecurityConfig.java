package com.provectus.kafka.ui.config.auth;

import com.provectus.kafka.ui.config.CognitoOidcLogoutSuccessHandler;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.type", havingValue = "OAUTH2_COGNITO")
@Slf4j
public class CognitoOAuthSecurityConfig extends AbstractAuthSecurityConfig {

  @Bean
  public SecurityWebFilterChain configure(ServerHttpSecurity http, Environment env) {
    log.info("Configuring Cognito OAUTH2 authentication.");

    String clientId = env.getRequiredProperty("auth.cognito.client-id");
    String logoutUrl = env.getRequiredProperty("auth.cognito.logout-url");

    final ServerLogoutSuccessHandler logoutHandler = new CognitoOidcLogoutSuccessHandler(logoutUrl, clientId);

    return http.authorizeExchange()
        .pathMatchers(AUTH_WHITELIST)
        .permitAll()
        .anyExchange()
        .authenticated()

        .and()
        .oauth2Login()

        .and()
        .oauth2Client()

        .and()
        .logout()
        .logoutSuccessHandler(logoutHandler)

        .and()
        .csrf().disable()
        .build();
  }

  @Bean
  public InMemoryReactiveClientRegistrationRepository clientRegistrationRepository(Environment env) {
    String issuerUrl = env.getRequiredProperty("auth.cognito.issuer-uri");
    String clientId = env.getRequiredProperty("auth.cognito.client-id");
    String clientSecret = env.getRequiredProperty("auth.cognito.client-secret");

    String scope = env.getProperty("auth.cognito.scope");
    String userNameAttribute = env.getProperty("auth.cognito.user-name-attribute");

    ClientRegistration.Builder builder = ClientRegistrations.fromIssuerLocation(issuerUrl).registrationId("cognito");

    builder.clientId(clientId);
    builder.clientSecret(clientSecret);

    Optional.ofNullable(scope).ifPresent(builder::scope);
    Optional.ofNullable(userNameAttribute).ifPresent(builder::userNameAttributeName);

    return new InMemoryReactiveClientRegistrationRepository(builder.build());
  }

}