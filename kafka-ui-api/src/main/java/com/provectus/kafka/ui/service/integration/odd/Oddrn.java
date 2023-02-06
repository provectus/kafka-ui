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

  static KafkaPath clusterOddrnPath(KafkaCluster cluster) {
    return KafkaPath.builder()
        .host(bootstrapServersForOddrn(cluster.getBootstrapServers()))
        .build();
  }

  static String clusterOddrn(KafkaCluster cluster) {
    return generateOddrn(clusterOddrnPath(cluster), "host");
  }

  static KafkaPath topicOddrnPath(KafkaCluster cluster, String topic) {
    return KafkaPath.builder()
        .host(bootstrapServersForOddrn(cluster.getBootstrapServers()))
        .topic(topic)
        .build();
  }

  static String topicOddrn(KafkaCluster cluster, String topic) {
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

  String connectorOddrn(String connectUrl, String connectorName) {
    String connectorHost = Stream.of(connectUrl.split(","))
        .map(String::trim)
        .sorted()
        //TODO[discuss]: leaving host and [port] in oddrn
        .map(url -> {
          var uri = URI.create(url);
          String host = uri.getHost();
          String portSuffix = (uri.getPort() > 0 ? (":" + uri.getPort()) : "");
          return host + portSuffix;
        })
        .collect(Collectors.joining(","));

    return generateOddrn(
        KafkaConnectorPath.builder()
            .host(connectorHost)
            .connector(connectorName)
            .build(),
        "connector"
    );
  }

  @SneakyThrows
  public String generateOddrn(OddrnPath path, String field) {
    return GENERATOR.generate(path, field);
  }

  private static String bootstrapServersForOddrn(String bootstrapServers) {
    return Stream.of(bootstrapServers.split(","))
        .map(String::trim)
        .sorted()
        .collect(Collectors.joining(","));
  }

}
