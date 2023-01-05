package com.provectus.kafka.ui.config.auth;

import com.provectus.kafka.ui.service.rbac.extractor.RbacLdapAuthoritiesExtractor;
import java.util.Collection;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.ldap.LdapAutoConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.ldap.core.support.BaseLdapPathContextSource;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.ReactiveAuthenticationManagerAdapter;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.ldap.authentication.AbstractLdapAuthenticationProvider;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.ldap.authentication.ad.ActiveDirectoryLdapAuthenticationProvider;
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch;
import org.springframework.security.ldap.search.LdapUserSearch;
import org.springframework.security.ldap.userdetails.LdapAuthoritiesPopulator;
import org.springframework.security.ldap.userdetails.LdapUserDetailsMapper;
import org.springframework.security.ldap.userdetails.UserDetailsContextMapper;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.type", havingValue = "LDAP")
@Import(LdapAutoConfiguration.class)
@Slf4j
public class LdapSecurityConfig extends AbstractAuthSecurityConfig {

  @Value("${spring.ldap.urls}") // TODO properties
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

  @Value("${oauth2.ldap.activeDirectory:false}")
  private boolean isActiveDirectory;
  @Value("${oauth2.ldap.aсtiveDirectory.domain:#{null}}")
  private String activeDirectoryDomain;

  @Bean
  public ReactiveAuthenticationManager authenticationManager(BaseLdapPathContextSource contextSource,
                                                             ApplicationContext context) {
    BindAuthenticator ba = new BindAuthenticator(contextSource);
    if (ldapUserDnPattern != null) {
      ba.setUserDnPatterns(new String[] {ldapUserDnPattern});
    }
    if (userFilterSearchFilter != null) {
      LdapUserSearch userSearch =
          new FilterBasedLdapUserSearch(userFilterSearchBase, userFilterSearchFilter, contextSource);
      ba.setUserSearch(userSearch);
    }

    AbstractLdapAuthenticationProvider authenticationProvider;
    if (!isActiveDirectory) {
      authenticationProvider = new LdapAuthenticationProvider(ba, authoritiesPopulator(context));
      authenticationProvider.setUserDetailsContextMapper(userDetailsContextMapper());
    } else {
      authenticationProvider = new ActiveDirectoryLdapAuthenticationProvider(activeDirectoryDomain, ldapUrls);
      authenticationProvider.setUseAuthenticationRequestCredentials(true);
    }

    AuthenticationManager am = new ProviderManager(List.of(authenticationProvider));

    return new ReactiveAuthenticationManagerAdapter(am);
  }

  @Bean
  @Primary
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
    if (isActiveDirectory) {
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
  public UserDetailsContextMapper userDetailsContextMapper() {
    return new LdapUserDetailsMapper() {
      @Override
      public UserDetails mapUserFromContext(DirContextOperations ctx, String username, Collection<? extends GrantedAuthority> authorities) {
        UserDetails userDetails = super.mapUserFromContext(ctx, username, authorities);
        return new RbacLdapUser(userDetails);
      }
    };
  }

  @Bean
  LdapAuthoritiesPopulator authoritiesPopulator(ApplicationContext context) {
    RbacLdapAuthoritiesExtractor extractor = new RbacLdapAuthoritiesExtractor(context);
    extractor.setRolePrefix("");
    return extractor;
  }

/*  @Autowired
  public void configure(AuthenticationManagerBuilder auth) throws Exception {
    var a = auth
        .ldapAuthentication()
        .userDnPatterns("uid={0},ou=people")
        .groupSearchBase("ou=groups")
        .contextSource()
        .url()
        .managerDn()
        .managerPassword()
        .and()
//        .passwordCompare()
//        .passwordEncoder(new BCryptPasswordEncoder())
//        .passwordAttribute("userPassword");
    ;
    if (isActiveDirectory) {
      a.authenticationProvider()
    }
  }*/

}

