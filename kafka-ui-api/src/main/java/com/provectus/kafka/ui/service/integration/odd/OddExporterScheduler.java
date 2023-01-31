package com.provectus.kafka.ui.service.integration.odd;

import com.provectus.kafka.ui.service.ClustersStorage;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;

@RequiredArgsConstructor
class OddExporterScheduler {

  private final ClustersStorage clustersStorage;
  private final OddExporter oddExporter;

  @Scheduled(fixedRateString = "${kafka.send-stats-to-odd-millis:30000}")
  public void sendMetricsToOdd() {
    Flux.fromIterable(clustersStorage.getKafkaClusters())
        .parallel()
        .runOn(Schedulers.parallel())
        .flatMap(oddExporter::export)
        .then()
        .block();
  }


}

