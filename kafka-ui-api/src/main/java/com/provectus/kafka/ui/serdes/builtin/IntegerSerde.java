package com.provectus.kafka.ui.serdes.builtin;

import com.google.common.primitives.Ints;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import java.util.Map;
import java.util.Optional;

public class IntegerSerde implements BuiltInSerde {

  public static String name() {
    return "Integer";
  }

  @Override
  public void configure(PropertyResolver serdeProperties,
                        PropertyResolver kafkaClusterProperties,
                        PropertyResolver globalProperties) {
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
    return input -> Ints.toByteArray(Integer.parseInt(input));
  }

  @Override
  public Deserializer deserializer(String topic, Type type) {
    return (headers, data) ->
        new DeserializeResult(
            String.valueOf(Ints.fromByteArray(data)),
            DeserializeResult.Type.JSON,
            Map.of()
        );
  }
}
