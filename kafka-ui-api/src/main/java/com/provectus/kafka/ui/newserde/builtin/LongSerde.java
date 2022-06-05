package com.provectus.kafka.ui.newserde.builtin;

import com.google.common.primitives.Longs;
import com.provectus.kafka.ui.newserde.spi.DeserializeResult;
import com.provectus.kafka.ui.newserde.spi.PropertyResolver;
import com.provectus.kafka.ui.newserde.spi.SchemaDescription;
import org.apache.kafka.common.header.Headers;

import java.util.Map;
import java.util.Optional;

public class LongSerde implements BuiltInSerde {

  @Override
  public void configure(PropertyResolver serdeProperties, PropertyResolver kafkaClusterProperties, PropertyResolver globalProperties) {

  }

  @Override
  public Optional<String> description() {
    return Optional.empty();
  }

  @Override
  public Optional<SchemaDescription> getSchema(String topic, Type type) {
    return Optional.empty();
  }

  @Override
  public boolean canDeserialize(String topic, Type type) {
    return true;
  }

  @Override
  public boolean canSerialize(String topic, Type type) {
    return true;
  }

  @Override
  public Serializer serializer(String topic, Type type) {
    return (topic1, input) -> Longs.toByteArray(Long.parseLong(input));
  }

  @Override
  public Deserializer deserializer(String topic, Type type) {
    return new Deserializer() {
      @Override
      public DeserializeResult deserialize(String topic, Headers headers, byte[] data) {
        return new DeserializeResult(
            String.valueOf(Longs.fromByteArray(data)),
            DeserializeResult.Type.JSON,
            Map.of()
        );
      }
    };
  }
}
