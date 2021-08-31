package com.provectus.kafka.ui.model;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class JmxConnectionInfo {

  @EqualsAndHashCode.Include
  private final String url;
  private final boolean ssl;
  private final String username;
  private final String password;

  public JmxConnectionInfo(String url) {
    this.url = url;
    this.ssl = false;
    this.username = null;
    this.password = null;
  }
}
