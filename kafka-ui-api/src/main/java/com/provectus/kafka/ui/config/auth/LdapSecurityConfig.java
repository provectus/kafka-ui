package com.provectus.kafka.ui.config.auth;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ldap.core.support.BaseLdapPathContextSource;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.ReactiveAuthenticationManagerAdapter;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch;
import org.springframework.security.ldap.search.LdapUserSearch;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.type", havingValue = "LDAP")
@Log4j2
public class LdapSecurityConfig extends AbstractAuthSecurityConfig {

  @Value("${spring.ldap.urls}")
  private String ldapUrls;
  @Value("${spring.ldap.dn.pattern:#{null}}")
  private String ldapUserDnPattern;
  @Value("${spring.ldap.adminUser:#{null}}")
  private String adminUser;
  @Value("${spring.ldap.adminPassword:#{null}}")
  private String adminPassword;
  @Value("${spring.ldap.userFilter.searchBase:#{null}}")
  private String userFilterSearchBase;
  @Value("${spring.ldap.userFilter.searchFilter:#{null}}")
  private String userFilterSearchFilter;

  @Bean
  public ReactiveAuthenticationManager authenticationManager(BaseLdapPathContextSource contextSource) {
    BindAuthenticator ba = new BindAuthenticator(contextSource);
    if (ldapUserDnPattern != null) {
      ba.setUserDnPatterns(new String[]{ldapUserDnPattern});
    }
    if (userFilterSearchFilter != null) {
      LdapUserSearch userSearch =
              new FilterBasedLdapUserSearch(userFilterSearchBase, userFilterSearchFilter, contextSource);
      ba.setUserSearch(userSearch);
    }

    LdapAuthenticationProvider lap = new LdapAuthenticationProvider(ba);

    AuthenticationManager am = new ProviderManager(List.of(lap));

    return new ReactiveAuthenticationManagerAdapter(am);
  }

  @Bean
  public BaseLdapPathContextSource contextSource() {
    LdapContextSource ctx = new LdapContextSource();
    ctx.setUrl(ldapUrls);
    ctx.setUserDn(adminUser);
    ctx.setPassword(adminPassword);
    ctx.afterPropertiesSet();
    return ctx;
  }

  @Bean
  public SecurityWebFilterChain configureLdap(ServerHttpSecurity http) {
    log.info("Configuring LDAP authentication.");

    http
        .authorizeExchange()
        .pathMatchers(AUTH_WHITELIST)
        .permitAll()
        .anyExchange()
        .authenticated()
        .and()
        .httpBasic();

    return http.csrf().disable().build();
  }

}

