package com.provectus.kafka.ui.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties("httpclient")
@Data
public class HttpClientProperties {

  Integer connectTimeoutMillis;
  Boolean socketKeepAlive;
  Integer tcpKeepIdle;
  Integer tcpKeepInterval;
  Integer tcpKeepCount;
}
