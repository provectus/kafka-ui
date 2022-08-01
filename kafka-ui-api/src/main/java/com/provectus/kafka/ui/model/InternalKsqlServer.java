package com.provectus.kafka.ui.model;

import lombok.Builder;
import lombok.Data;
import lombok.ToString;

@Data
@ToString(exclude = "password")
@Builder(toBuilder = true)
public class InternalKsqlServer {
  private final String url;
  private final String username;
  private final String password;
}
