package com.provectus.kafka.ui.serdes.builtin;

import com.google.common.primitives.Longs;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import org.apache.kafka.common.header.Headers;

import java.util.Map;
import java.util.Optional;

//TODO: discuss - maybe we should just use Int64, Int32, UInt64, UInt32 naming?
public class LongSerde implements BuiltInSerde {

  public static String name() {
    return "Long";
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
