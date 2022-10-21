package com.provectus.kafka.ui.config.auth;

import java.util.Collection;
import lombok.RequiredArgsConstructor;
import lombok.Value;

@Value
public class AuthenticatedUser {

  String principal;
  Collection<String> groups;

  public String getPrincipal() {
    return principal;
  }

  public Collection<String> getGroups() {
    return groups;
  }

}
