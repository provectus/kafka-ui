package com.provectus.kafka.ui.model;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public enum Feature {
  KAFKA_CONNECT(cluster -> Optional.ofNullable(cluster.getKafkaConnect())
      .filter(Predicate.not(List::isEmpty))
      .isPresent()
  ),
  KSQL_DB(cluster -> cluster.getKsqldbServer() != null),
  SCHEMA_REGISTRY(cluster -> cluster.getSchemaRegistry() != null);

  private final Predicate<KafkaCluster> isEnabled;

  Feature(Predicate<KafkaCluster> isEnabled) {
    this.isEnabled = isEnabled;
  }

  public static List<Feature> getEnabledFeatures(KafkaCluster cluster) {
    return Arrays.stream(values())
        .filter(feature -> feature.isEnabled.test(cluster))
        .collect(Collectors.toList());
  }
}
