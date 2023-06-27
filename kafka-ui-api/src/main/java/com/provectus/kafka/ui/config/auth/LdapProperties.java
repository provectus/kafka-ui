package com.provectus.kafka.ui.config.auth;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("spring.ldap")
@Data
public class LdapProperties {

  private String urls;
  private String base;
  private String adminUser;
  private String adminPassword;
  private String userFilterSearchBase;
  private String userFilterSearchFilter;
  private String groupFilterSearchBase;
  private String groupFilterSearchFilter;
  private String groupRoleAttribute;

  @Value("${oauth2.ldap.activeDirectory:false}")
  private boolean isActiveDirectory;
  @Value("${oauth2.ldap.aсtiveDirectory.domain:@null}")
  private String activeDirectoryDomain;

}
