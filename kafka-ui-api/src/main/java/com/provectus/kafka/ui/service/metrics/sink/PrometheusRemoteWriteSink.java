package com.provectus.kafka.ui.service.metrics.sink;

import static io.prometheus.client.Collector.MetricFamilySamples;
import static prometheus.Types.Label;
import static prometheus.Types.Sample;
import static prometheus.Types.TimeSeries;

import com.provectus.kafka.ui.util.WebClientConfigurator;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URI;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.util.unit.DataSize;
import org.springframework.web.reactive.function.client.WebClient;
import org.xerial.snappy.Snappy;
import prometheus.Remote;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
class PrometheusRemoteWriteSink implements MetricsSink {

  private final WebClient webClient;
  private final URI writeEndpoint;

  PrometheusRemoteWriteSink(String prometheusUrl) {
    this.writeEndpoint = URI.create(prometheusUrl).resolve("/api/v1/write");
    this.webClient = new WebClientConfigurator().configureBufferSize(DataSize.ofMegabytes(20)).build();
  }

  @SneakyThrows
  @Override
  public Mono<Void> send(Stream<MetricFamilySamples> metrics) {
    byte[] bytesToWrite = Snappy.compress(createWriteRequest(metrics).toByteArray());
    return webClient.post()
        .uri(writeEndpoint)
        .header("Content-Type", "application/x-protobuf")
        .header("User-Agent", "promremote-kui/0.1.0")
        .header("Content-Encoding", "snappy")
        .header("X-Prometheus-Remote-Write-Version", "0.1.0")
        .bodyValue(bytesToWrite)
        .retrieve()
        .toBodilessEntity()
        .then();
  }

  private static Remote.WriteRequest createWriteRequest(Stream<MetricFamilySamples> metrics) {
    long currentTs = System.currentTimeMillis();
    Remote.WriteRequest.Builder request = Remote.WriteRequest.newBuilder();
    metrics.forEach(mfs -> {
      for (MetricFamilySamples.Sample sample : mfs.samples) {
        TimeSeries.Builder timeSeriesBuilder = TimeSeries.newBuilder();
        timeSeriesBuilder.addLabels(
            Label.newBuilder().setName("__name__").setValue(sample.name)
        );
        for (int i = 0; i < sample.labelNames.size(); i++) {
          timeSeriesBuilder.addLabels(
              Label.newBuilder()
                  .setName(sample.labelNames.get(i))
                  .setValue(escapedLabelValue(sample.labelValues.get(i)))
          );
        }
        timeSeriesBuilder.addSamples(
            Sample.newBuilder()
                .setValue(sample.value)
                .setTimestamp(currentTs)
        );
        request.addTimeseries(timeSeriesBuilder);
      }
    });
    //TODO: how to pass Metadata ???
    return request.build();
  }

  private static String escapedLabelValue(String s) {
    StringWriter writer = new StringWriter(s.length());
    for (int i = 0; i < s.length(); i++) {
      char c = s.charAt(i);
      switch (c) {
        case '\\' -> writer.append("\\\\");
        case '\"' -> writer.append("\\\"");
        case '\n' -> writer.append("\\n");
        default -> writer.append(c);
      }
    }
    return writer.toString();
  }

}
