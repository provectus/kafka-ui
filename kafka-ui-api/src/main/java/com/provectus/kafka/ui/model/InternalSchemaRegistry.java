package com.provectus.kafka.ui.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class InternalSchemaRegistry {
  private final String username;
  private final String password;
  private final String url;
}
