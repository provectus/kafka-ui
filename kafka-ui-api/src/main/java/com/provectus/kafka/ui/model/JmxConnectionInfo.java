package com.provectus.kafka.ui.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class JmxConnectionInfo {

  private final String url;
  private final String username;
  private final String password;

  public JmxConnectionInfo(String url) {
    this.url = url;
    this.username = null;
    this.password = null;
  }
}
