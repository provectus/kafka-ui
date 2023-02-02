package com.provectus.kafka.ui.config.auth;

import static com.provectus.kafka.ui.config.auth.AbstractAuthSecurityConfig.AUTH_WHITELIST;

import com.provectus.kafka.ui.service.rbac.AccessControlService;
import com.provectus.kafka.ui.service.rbac.extractor.RbacLdapAuthoritiesExtractor;
import java.util.Collection;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.ldap.LdapAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.ldap.authentication.ad.ActiveDirectoryLdapAuthenticationProvider;
import org.springframework.security.ldap.userdetails.LdapUserDetailsMapper;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.type", havingValue = "LDAP")
@Import(LdapAutoConfiguration.class)
@EnableConfigurationProperties(LdapProperties.class)
@RequiredArgsConstructor
@Slf4j
public class LdapSecurityConfig {

  private final LdapProperties props;

  @Autowired
  public void authenticationManager(AuthenticationManagerBuilder builder, ApplicationContext context,
                                    @Nullable AccessControlService acs) throws Exception {
    var configurer = builder.ldapAuthentication();

    if (props.isActiveDirectory()) {
      builder.authenticationProvider(activeDirectoryAuthenticationProvider());
    }

    if (acs != null && acs.isRbacEnabled()) {
      configurer.ldapAuthoritiesPopulator(new RbacLdapAuthoritiesExtractor(context));
    } else {
      configurer.groupSearchBase(props.getGroupSearchBase());
    }

    configurer.userDetailsContextMapper(new UserDetailsMapper());

    configurer
        .userDnPatterns(props.getDnPattern())
        .userSearchBase(props.getUserFilterSearchBase())
        .userSearchFilter(props.getUserFilterSearchFilter())
        .contextSource()
        .url(props.getUrls())
        .managerDn(props.getAdminUser())
        .managerPassword(props.getAdminPassword());
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration conf) throws Exception {
    conf.authenticationManagerBuilder()
    return conf.getAuthenticationManager();
  }

  @Bean
  public SecurityWebFilterChain configureLdap(ServerHttpSecurity http) {
    log.info("Configuring LDAP authentication.");
    if (props.isActiveDirectory()) {
      log.info("Active Directory support for LDAP has been enabled.");
    }

    return http
        .authorizeExchange()
        .pathMatchers(AUTH_WHITELIST)
        .permitAll()
        .anyExchange()
        .authenticated()

        .and()
        .formLogin()

        .and()
        .logout()

        .and()
        .csrf().disable()
        .build();
  }

  @Bean
  @ConditionalOnProperty(value = "oauth2.ldap.activeDirectory", havingValue = "true")
  public AuthenticationProvider activeDirectoryAuthenticationProvider() {
    var provider = new ActiveDirectoryLdapAuthenticationProvider(props.getActiveDirectoryDomain(), props.getUrls());
    provider.setUseAuthenticationRequestCredentials(true);
    return provider;
  }

  private static class UserDetailsMapper extends LdapUserDetailsMapper {
    @Override
    public UserDetails mapUserFromContext(DirContextOperations ctx, String username,
                                          Collection<? extends GrantedAuthority> authorities) {
      UserDetails userDetails = super.mapUserFromContext(ctx, username, authorities);
      return new RbacLdapUser(userDetails);
    }
  }

}

