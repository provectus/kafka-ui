package com.provectus.kafka.ui.service.integration.odd;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;


@Data
@ConfigurationProperties("integration.odd")
public class OddIntegrationProperties {

  String url;
  String token;
  String topicsRegex;

}
