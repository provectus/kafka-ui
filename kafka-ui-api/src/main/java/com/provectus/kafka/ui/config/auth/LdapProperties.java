package com.provectus.kafka.ui.config.auth;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("spring.ldap")
@Data
public class LdapProperties {

  private String urls;
  private String dnPattern;
  private String adminUser;
  private String adminPassword;
  private String userFilterSearchBase;
  private String userFilterSearchFilter;
  private String groupSearchBase;

  @Value("${oauth2.ldap.activeDirectory}")
  private boolean isActiveDirectory;
  @Value("${oauth2.ldap.aсtiveDirectory.domain}")
  private String activeDirectoryDomain;

}
