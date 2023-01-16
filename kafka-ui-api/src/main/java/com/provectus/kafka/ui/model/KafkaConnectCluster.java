package com.provectus.kafka.ui.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class KafkaConnectCluster {
  private final String name;
  private final String address;
  private final String userName;
  private final String password;

  private final String keystoreLocation;
  private final String truststoreLocation;
  private final String keystorePassword;
  private final String truststorePassword;
}
