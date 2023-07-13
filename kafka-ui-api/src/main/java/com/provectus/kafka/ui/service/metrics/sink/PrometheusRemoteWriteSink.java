package com.provectus.kafka.ui.service.metrics.sink;

import static io.prometheus.client.Collector.*;
import static prometheus.Types.*;

import com.google.common.base.Enums;
import com.provectus.kafka.ui.util.WebClientConfigurator;
import groovy.lang.Tuple;
import io.prometheus.client.Collector;
import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.MediaType;
import org.springframework.util.unit.DataSize;
import org.springframework.web.reactive.function.client.WebClient;
import org.xerial.snappy.Snappy;
import prometheus.Remote;
import prometheus.Types;
import prometheus.Types.MetricMetadata.MetricType;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@RequiredArgsConstructor
class PrometheusRemoteWriteSink implements MetricsSink {

  private final WebClient webClient;
  private final String writeEndpoint;

  PrometheusRemoteWriteSink(String prometheusUrl) {
    this.writeEndpoint = prometheusUrl + "/api/v1/write";
    this.webClient = new WebClientConfigurator().configureBufferSize(DataSize.ofMegabytes(20)).build();
  }

  @SneakyThrows
  @Override
  public Mono<Void> send(Stream<MetricFamilySamples> metrics) {
    byte[] bytesToWrite = Snappy.compress(createWriteRequest(metrics).toByteArray());
    return webClient.post()
        .uri(writeEndpoint)
        //.contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .contentType(MediaType.parseMediaType("application/x-protobuf")) //???
        .header("User-Agent", "promremote-kui/0.1.0")
        .header("Content-Encoding", "snappy")
        .header("X-Prometheus-Remote-Write-Version", "0.1.0")
        .bodyValue(bytesToWrite)
        .retrieve()
        .toBodilessEntity()
        .then();
  }

  private Remote.WriteRequest createWriteRequest(Stream<MetricFamilySamples> metrics) {
    var tsAndMeta = createTimeSeries(metrics);
    return Remote.WriteRequest.newBuilder()
        .addAllTimeseries(tsAndMeta.getT1())
        .addAllMetadata(tsAndMeta.getT2())
        .build();
  }

  public Tuple2<List<TimeSeries>, List<MetricMetadata>> createTimeSeries(Stream<MetricFamilySamples> metrics) {
    long currentTs = System.currentTimeMillis();
    List<TimeSeries> timeSeriesList = new ArrayList<>();
    List<MetricMetadata> metadatasList = new ArrayList<>();
    metrics.forEach(mfs -> {
      for (MetricFamilySamples.Sample sample : mfs.samples) {
        TimeSeries.Builder timeSeriesBuilder = TimeSeries.newBuilder();
        timeSeriesBuilder.addLabels(
            Label.newBuilder()
                .setName("__name__")
                .setValue(escapedLabelValue(sample.name))
                .build()
        );
        for (int i = 0; i < sample.labelNames.size(); i++) {
          timeSeriesBuilder.addLabels(
              Label.newBuilder()
                  .setName(sample.labelNames.get(i))
                  .setValue(escapedLabelValue(sample.labelValues.get(i)))
                  .build()
          );
        }
        timeSeriesBuilder.addSamples(
            Sample.newBuilder()
                .setValue(sample.value)
                .setTimestamp(currentTs)
                .build()
        );
        timeSeriesList.add(timeSeriesBuilder.build());
        metadatasList.add(
            MetricMetadata.newBuilder()
                .setType(Enums.getIfPresent(MetricType.class, mfs.type.toString()).or(MetricType.UNKNOWN))
                .setHelp(mfs.help)
                .setUnit(mfs.unit)
                .build()
        );
      }
    });
    return Tuples.of(timeSeriesList, metadatasList);
  }

  private static String escapedLabelValue(String s) {
    //TODO: refactor
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
