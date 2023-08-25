package com.provectus.kafka.ui.service.metrics.sink;

import static com.provectus.kafka.ui.service.MessagesService.createProducer;
import static com.provectus.kafka.ui.service.metrics.prometheus.PrometheusExpose.escapedLabelValue;
import static io.prometheus.client.Collector.MetricFamilySamples;
import static io.prometheus.client.Collector.doubleToGoString;
import static org.apache.kafka.clients.producer.ProducerConfig.COMPRESSION_TYPE_CONFIG;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.provectus.kafka.ui.config.ClustersProperties;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.kafka.clients.producer.Producer;
import org.apache.kafka.clients.producer.ProducerRecord;
import reactor.core.publisher.Mono;

/*
 * Format of records copied from https://github.com/Telefonica/prometheus-kafka-adapter
 */
@RequiredArgsConstructor
class KafkaSink implements MetricsSink {

  record KafkaMetric(String timestamp, String value, String name, Map<String, String> labels) { }

  private static final JsonMapper JSON_MAPPER = new JsonMapper();

  private static final Map<String, Object> PRODUCER_ADDITIONAL_CONFIGS = Map.of(COMPRESSION_TYPE_CONFIG, "gzip");

  private final String topic;
  private final Producer<byte[], byte[]> producer;

  static KafkaSink create(ClustersProperties.Cluster cluster, String targetTopic) {
    return new KafkaSink(targetTopic, createProducer(cluster, PRODUCER_ADDITIONAL_CONFIGS));
  }

  @Override
  public Mono<Void> send(Stream<MetricFamilySamples> metrics) {
    return Mono.fromRunnable(() -> {
      String ts = Instant.now()
          .truncatedTo(ChronoUnit.SECONDS)
          .atZone(ZoneOffset.UTC)
          .format(DateTimeFormatter.ISO_DATE_TIME);

      metrics.flatMap(m -> createRecord(ts, m)).forEach(producer::send);
    });
  }

  private Stream<ProducerRecord<byte[], byte[]>> createRecord(String ts, MetricFamilySamples metrics) {
    return metrics.samples.stream()
        .map(sample -> {
          var lbls = new LinkedHashMap<String, String>();
          lbls.put("__name__", sample.name);
          for (int i = 0; i < sample.labelNames.size(); i++) {
            lbls.put(sample.labelNames.get(i), escapedLabelValue(sample.labelValues.get(i)));
          }
          var km = new KafkaMetric(ts, doubleToGoString(sample.value), sample.name, lbls);
          return new ProducerRecord<>(topic, toJsonBytes(km));
        });
  }

  @SneakyThrows
  private static byte[] toJsonBytes(KafkaMetric m) {
    return JSON_MAPPER.writeValueAsBytes(m);
  }

}
