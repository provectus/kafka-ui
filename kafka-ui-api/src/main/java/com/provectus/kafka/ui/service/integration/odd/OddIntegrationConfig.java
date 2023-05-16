package com.provectus.kafka.ui.service.integration.odd;

import com.provectus.kafka.ui.service.ClustersStorage;
import com.provectus.kafka.ui.service.KafkaConnectService;
import com.provectus.kafka.ui.service.StatisticsCache;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(value = "integration.odd.url")
class OddIntegrationConfig {

  @Bean
  OddIntegrationProperties oddIntegrationProperties() {
    return new OddIntegrationProperties();
  }

  @Bean
  OddExporter oddExporter(StatisticsCache statisticsCache,
                          KafkaConnectService connectService,
                          OddIntegrationProperties oddIntegrationProperties) {
    return new OddExporter(statisticsCache, connectService, oddIntegrationProperties);
  }

  @Bean
  OddExporterScheduler oddExporterScheduler(ClustersStorage storage, OddExporter exporter) {
    return new OddExporterScheduler(storage, exporter);
  }

}
