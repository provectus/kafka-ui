package com.provectus.kafka.ui.service.integration.odd;

import com.provectus.kafka.ui.model.KafkaCluster;
import java.net.URI;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.experimental.UtilityClass;
import org.opendatadiscovery.oddrn.Generator;
import org.opendatadiscovery.oddrn.model.AwsS3Path;
import org.opendatadiscovery.oddrn.model.KafkaConnectorPath;
import org.opendatadiscovery.oddrn.model.KafkaPath;

@UtilityClass
public class Oddrn {

  private static final Generator GENERATOR = new Generator();

  String clusterOddrn(KafkaCluster cluster) {
    return KafkaPath.builder()
        .cluster(bootstrapServersForOddrn(cluster.getBootstrapServers()))
        .build()
        .oddrn();
  }

  KafkaPath topicOddrnPath(KafkaCluster cluster, String topic) {
    return KafkaPath.builder()
        .cluster(bootstrapServersForOddrn(cluster.getBootstrapServers()))
        .topic(topic)
        .build();
  }

  String topicOddrn(KafkaCluster cluster, String topic) {
    return topicOddrnPath(cluster, topic).oddrn();
  }

  String awsS3Oddrn(String bucket, String key) {
    return AwsS3Path.builder()
        .bucket(bucket)
        .key(key)
        .build()
        .oddrn();
  }

  String connectDataSourceOddrn(String connectUrl) {
    return KafkaConnectorPath.builder()
        .host(normalizedConnectHosts(connectUrl))
        .build()
        .oddrn();
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
    return KafkaConnectorPath.builder()
        .host(normalizedConnectHosts(connectUrl))
        .connector(connectorName)
        .build()
        .oddrn();
  }

  private String bootstrapServersForOddrn(String bootstrapServers) {
    return Stream.of(bootstrapServers.split(","))
        .map(String::trim)
        .sorted()
        .collect(Collectors.joining(","));
  }

}
