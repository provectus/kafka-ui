package com.provectus.kafka.ui.config.auth;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class RbacLoginFormUser implements UserDetails, RbacUser {

  private final String username;
  private final String passwordHash;
  private final boolean enabled;
  private final List<String> roles;

  public RbacLoginFormUser(String username, String passwordHash, boolean enabled, List<String> roles) {
    this.username = username;
    this.passwordHash = passwordHash;
    this.enabled = enabled;
    this.roles = roles;
  }

  @Override
  public String name() {
    return username;
  }

  @Override
  public Collection<String> groups() {
    return roles;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toSet());
  }

  @Override
  public String getPassword() {
    return passwordHash;
  }

  @Override
  public String getUsername() {
    return username;
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return enabled;
  }
}
