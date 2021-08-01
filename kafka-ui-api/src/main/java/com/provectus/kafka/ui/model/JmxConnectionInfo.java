package com.provectus.kafka.ui.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class JmxConnectionInfo {

  private final String url;
  @EqualsAndHashCode.Exclude
  private final String[] credentials;

  public JmxConnectionInfo(String url) {
    this.url = url;
    this.credentials = null;
  }
}
