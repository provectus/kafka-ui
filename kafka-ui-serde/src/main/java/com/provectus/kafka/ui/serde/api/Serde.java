package com.provectus.kafka.ui.serde.api;

import java.util.Optional;
import org.apache.kafka.common.header.Headers;

public interface Serde {

  enum Target {
    KEY, VALUE
  }

  void configure(
      PropertyResolver serdeProperties,
      PropertyResolver kafkaClusterProperties,
      PropertyResolver globalProperties
  );

  Optional<String> description();

  Optional<SchemaDescription> getSchema(String topic, Target type);

  boolean canDeserialize(String topic, Target type);

  boolean canSerialize(String topic, Target type);

  //----------------------------------------------------------------------------

  Serializer serializer(String topic, Target type);

  Deserializer deserializer(String topic, Target type);

  interface Serializer {
    byte[] serialize(String input);
  }

  interface Deserializer {
    DeserializeResult deserialize(Headers headers, byte[] data);
  }

}
