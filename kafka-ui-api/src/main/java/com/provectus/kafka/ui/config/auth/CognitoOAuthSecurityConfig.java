package com.provectus.kafka.ui.config.auth;

import com.provectus.kafka.ui.config.CognitoOidcLogoutSuccessHandler;
import com.provectus.kafka.ui.config.auth.props.CognitoProperties;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.type", havingValue = "OAUTH2_COGNITO")
@RequiredArgsConstructor
@Slf4j
public class CognitoOAuthSecurityConfig extends AbstractAuthSecurityConfig {

  private static final String COGNITO = "cognito";

  @Bean
  public SecurityWebFilterChain configure(ServerHttpSecurity http, CognitoProperties props) {
    log.info("Configuring Cognito OAUTH2 authentication.");

    String clientId = props.getClientId();
    String logoutUrl = props.getLogoutUri();

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
  public InMemoryReactiveClientRegistrationRepository clientRegistrationRepository(CognitoProperties props) {
    ClientRegistration.Builder builder = ClientRegistrations
        .fromIssuerLocation(props.getIssuerUri())
        .registrationId(COGNITO);

    builder.clientId(props.getClientId());
    builder.clientSecret(props.getClientSecret());

    Optional.ofNullable(props.getScope()).ifPresent(builder::scope);
    Optional.ofNullable(props.getUserNameAttribute()).ifPresent(builder::userNameAttributeName);

    return new InMemoryReactiveClientRegistrationRepository(builder.build());
  }

  @Bean
  @ConfigurationProperties("auth.cognito")
  public CognitoProperties cognitoProperties() {
    return new CognitoProperties();
  }

}