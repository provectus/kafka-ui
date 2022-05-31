package com.provectus.kafka.ui.newserde.spi;

import org.apache.kafka.common.header.Headers;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

public interface Serde {

  enum Type {
    KEY, VALUE
  }

  void configure(
      PropertyResolver serdeProperties,
      PropertyResolver kafkaClusterProperties,
      PropertyResolver globalProperties
  );

  Optional<String> description();

  Optional<SchemaDescription> getSchema(String topic, Type isKey);

  boolean canDeserialize(String topic, Type isKey);

  boolean canSerialize(String topic, Type isKey);

  //----------------------------------------------------------------------------

  Serializer serializer(String topic, Type isKey);

  Deserializer deserializer(String topic, Type isKey);

  interface Serializer {
    byte[] serialize(String topic, Headers headers, String input);
  }

  interface Deserializer {
    DeserializeResult deserialize(String topic, Headers headers, byte[] data);
  }

}
