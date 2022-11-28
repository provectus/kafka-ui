package com.provectus.kafka.ui.model;

import lombok.Builder;
import lombok.Data;
import lombok.ToString;

@Data
@ToString(exclude = {"password", "keystorePassword", "truststorePassword"})
@Builder(toBuilder = true)
public class InternalKsqlServer {
  private final String url;
  private final String username;
  private final String password;

  private final String keystoreLocation;
  private final String truststoreLocation;
  private final String keystorePassword;
  private final String truststorePassword;
}
