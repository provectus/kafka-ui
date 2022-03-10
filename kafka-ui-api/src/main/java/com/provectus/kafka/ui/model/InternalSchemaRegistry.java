package com.provectus.kafka.ui.model;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class InternalSchemaRegistry {
  private final String username;
  private final String password;
  private final List<String> url;

  public String getFirstUrl() {
    return url != null && !url.isEmpty() ? url.iterator().next() : null;
  }

}
