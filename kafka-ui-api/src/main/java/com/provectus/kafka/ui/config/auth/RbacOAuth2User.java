package com.provectus.kafka.ui.config.auth;

import java.util.Collection;
import java.util.Map;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

public record RbacOAuth2User(OAuth2User user, Collection<String> groups) implements RbacUser, OAuth2User {

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
