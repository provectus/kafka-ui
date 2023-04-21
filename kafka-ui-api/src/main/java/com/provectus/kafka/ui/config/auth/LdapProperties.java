package com.provectus.kafka.ui.config.auth;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("spring.ldap")
@Data
public class LdapProperties {

  private String urls;
  private String base; // TODO was dnPattern
  private String adminUser;
  private String adminPassword;
  private String userFilterSearchBase;
  private String userFilterSearchFilter;
  private String groupSearchBase;

  @Value("${oauth2.ldap.activeDirectory:false}")
  private boolean isActiveDirectory;
  @Value("${oauth2.ldap.aсtiveDirectory.domain:null}") // TODO null is a string here for some reason
  private String activeDirectoryDomain;

  @Value("${oauth2.ldap.groupRoleAttribute:cn}")
  private String groupRoleAttribute;

}
