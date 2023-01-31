package com.provectus.kafka.ui.service.integrations.odd;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;


@Data
@ConfigurationProperties("odd")
public class OddIntegrationProperties {

  String platformUrl;
  String token;
  String topicsRegex;

}
