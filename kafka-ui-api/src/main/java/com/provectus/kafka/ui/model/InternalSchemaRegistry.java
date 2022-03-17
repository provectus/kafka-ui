package com.provectus.kafka.ui.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class InternalSchemaRegistry {
  private final String username;
  private final String password;
  private final FailoverUrlList url;

  public String getPrimaryNodeUri() {
    return url.get(0);
  }

  public String getUri() {
    return url.current();
  }

  public void markAsUnavailable(String url) {
    this.url.fail(url);
  }

  public boolean isFailoverAvailable() {
    return this.url.isFailoverAvailable();
  }
}
