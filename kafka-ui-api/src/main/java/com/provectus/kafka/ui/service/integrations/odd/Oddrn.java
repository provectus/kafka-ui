package com.provectus.kafka.ui.service.integrations.odd;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.sql.Driver;
import java.sql.DriverManager;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.Builder;
import lombok.SneakyThrows;
import lombok.Value;
import lombok.experimental.UtilityClass;
import org.opendatadiscovery.oddrn.Generator;
import org.opendatadiscovery.oddrn.JdbcUrlParser;
import org.opendatadiscovery.oddrn.annotation.PathField;
import org.opendatadiscovery.oddrn.model.AwsS3Path;
import org.opendatadiscovery.oddrn.model.KafkaConnectorPath;
import org.opendatadiscovery.oddrn.model.KafkaPath;
import org.opendatadiscovery.oddrn.model.OddrnPath;

@UtilityClass
class Oddrn {

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
    return generateOddrn(AwsS3Path.builder()
            .bucket(bucket)
            .key(key)
            .build(),
        "key"
    );
  }

  @SneakyThrows
  String connectorOddrn(String connectName, String connectorName, KafkaCluster cluster) {
    String connectUrlsStr = cluster.getOriginalProperties().getKafkaConnect().stream()
        .filter(c -> c.getName().equals(connectName))
        .map(ClustersProperties.ConnectCluster::getAddress)
        .findAny()
        .orElseThrow(IllegalStateException::new);

    String connectorHost = Stream.of(connectUrlsStr.split(","))
        .map(String::trim)
        .sorted()
        .collect(Collectors.joining(","));

    return generateOddrn(
        KafkaConnectorPath.builder()
            .host(connectorHost)
            .connector(connectorName)
            .build(),
        "connector"
    );
  }

  String jdbcOddrn(String connectionUrl) {
    return generateOddrn(new JdbcUrlParser().parse(connectionUrl), "host");
  }

  @SneakyThrows
  String generateOddrn(OddrnPath path, String field) {
    return GENERATOR.generate(path, field);
  }

  private static String bootstrapServersForOddrn(String bootstrapServers) {
    return Stream.of(bootstrapServers.split(","))
        .map(String::trim)
        .sorted()
        .collect(Collectors.joining(","));
  }

}
