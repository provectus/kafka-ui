package com.provectus.kafka.ui.serde.api;

import java.util.Optional;

public interface Serde {

  enum Target {
    KEY, VALUE
  }

  void configure(
      PropertyResolver serdeProperties,
      PropertyResolver kafkaClusterProperties,
      PropertyResolver globalProperties
  );

  Optional<String> getDescription();

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
    DeserializeResult deserialize(RecordHeaders headers, byte[] data);
  }

}
