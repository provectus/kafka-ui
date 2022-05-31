package com.provectus.kafka.ui.newserde.impl;

import com.google.common.primitives.Longs;
import com.provectus.kafka.ui.newserde.spi.DeserializeResult;
import com.provectus.kafka.ui.newserde.spi.PropertyResolver;
import com.provectus.kafka.ui.newserde.spi.SchemaDescription;
import com.provectus.kafka.ui.newserde.spi.Serde;

import java.util.Map;
import java.util.Optional;

public class LongSerde implements Serde {

  @Override
  public void configure(PropertyResolver serdeProperties, PropertyResolver kafkaClusterProperties, PropertyResolver globalProperties) {
    // noop
  }

  @Override
  public Optional<String> description() {
    return Optional.of("Signed long (64 bit)");
  }

  @Override
  public Optional<SchemaDescription> getSchema(String topic, boolean isKey) {
    return Optional.empty();
  }

  @Override
  public boolean canDeserialize(String topic, boolean isKey) {
    return true;
  }

  @Override
  public boolean canSerialize(String topic, boolean isKey) {
    return true;
  }

  @Override
  public Serializer serializer(String topic, boolean isKey) {
    return (topic1, headers, input) -> Longs.toByteArray(Long.parseLong(input));
  }

  @Override
  public Deserializer deserializer(String topic, boolean isKey) {
    return (topic1, headers, data) ->
        new DeserializeResult(String.valueOf(Longs.fromByteArray(data)), Map.of());
  }
}
