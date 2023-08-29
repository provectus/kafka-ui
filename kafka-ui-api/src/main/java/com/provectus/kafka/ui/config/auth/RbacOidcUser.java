package com.provectus.kafka.ui.config.auth;

import java.util.Collection;
import java.util.Map;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

public record RbacOidcUser(OidcUser user, Collection<String> groups) implements RbacUser, OidcUser {

  @Override
  public Map<String, Object> getClaims() {
    return user.getClaims();
  }

  @Override
  public OidcUserInfo getUserInfo() {
    return user.getUserInfo();
  }

  @Override
  public OidcIdToken getIdToken() {
    return user.getIdToken();
  }

  @Override
  public Map<String, Object> getAttributes() {
    return user.getAttributes();
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return user.getAuthorities();
  }

  @Override
  public String getName() {
    return user.getName();
  }

  @Override
  public String name() {
    return user.getName();
  }
}
