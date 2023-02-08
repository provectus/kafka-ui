package com.provectus.kafka.ui.service.integration.odd;

import com.provectus.kafka.ui.model.KafkaCluster;
import java.net.URI;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;
import org.opendatadiscovery.oddrn.Generator;
import org.opendatadiscovery.oddrn.model.AwsS3Path;
import org.opendatadiscovery.oddrn.model.KafkaConnectorPath;
import org.opendatadiscovery.oddrn.model.KafkaPath;
import org.opendatadiscovery.oddrn.model.OddrnPath;

@UtilityClass
public class Oddrn {

  private static final Generator GENERATOR = new Generator();

  KafkaPath clusterOddrnPath(KafkaCluster cluster) {
    return KafkaPath.builder()
        .cluster(bootstrapServersForOddrn(cluster.getBootstrapServers()))
        .build();
  }

  String clusterOddrn(KafkaCluster cluster) {
    return generateOddrn(clusterOddrnPath(cluster), "cluster");
  }

  KafkaPath topicOddrnPath(KafkaCluster cluster, String topic) {
    return KafkaPath.builder()
        .cluster(bootstrapServersForOddrn(cluster.getBootstrapServers()))
        .topic(topic)
        .build();
  }

  String topicOddrn(KafkaCluster cluster, String topic) {
    return generateOddrn(topicOddrnPath(cluster, topic), "topic");
  }

  String awsS3Oddrn(String bucket, String key) {
    return generateOddrn(
        AwsS3Path.builder()
            .bucket(bucket)
            .key(key)
            .build(),
        "key"
    );
  }

  String connectDataSourceOddrn(String connectUrl) {
    return generateOddrn(
        KafkaConnectorPath.builder()
            .host(normalizedConnectHosts(connectUrl))
            .build(),
        "host"
    );
  }

  private String normalizedConnectHosts(String connectUrlStr) {
    return Stream.of(connectUrlStr.split(","))
        .map(String::trim)
        .sorted()
        .map(url -> {
          var uri = URI.create(url);
          String host = uri.getHost();
          String portSuffix = (uri.getPort() > 0 ? (":" + uri.getPort()) : "");
          return host + portSuffix;
        })
        .collect(Collectors.joining(","));
  }

  String connectorOddrn(String connectUrl, String connectorName) {
    return generateOddrn(
        KafkaConnectorPath.builder()
            .host(normalizedConnectHosts(connectUrl))
            .connector(connectorName)
            .build(),
        "connector"
    );
  }

  @SneakyThrows
  public String generateOddrn(OddrnPath path, String field) {
    return GENERATOR.generate(path, field);
  }

  private String bootstrapServersForOddrn(String bootstrapServers) {
    return Stream.of(bootstrapServers.split(","))
        .map(String::trim)
        .sorted()
        .collect(Collectors.joining(","));
  }

}
