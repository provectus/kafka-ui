package com.provectus.kafka.ui.serdes.builtin;

import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;

public class HexSerde implements BuiltInSerde {

  private HexFormat hexFormat;

  public static String name() {
    return "HEX";
  }

  @Override
  public void configure(PropertyResolver serdeProperties,
                        PropertyResolver kafkaClusterProperties,
                        PropertyResolver globalProperties) {
    String delim = serdeProperties.getProperty("delimiter", String.class).orElse(" ");
    boolean uppercase = serdeProperties.getProperty("uppercase", Boolean.class).orElse(true);
    hexFormat = HexFormat.ofDelimiter(delim);
    if (uppercase) {
      hexFormat = hexFormat.withUpperCase();
    }
  }

  @Override
  public Optional<String> getDescription() {
    return Optional.empty();
  }

  @Override
  public Optional<SchemaDescription> getSchema(String topic, Target type) {
    return Optional.empty();
  }

  @Override
  public boolean canDeserialize(String topic, Target type) {
    return true;
  }

  @Override
  public boolean canSerialize(String topic, Target type) {
    return true;
  }

  @Override
  public Serializer serializer(String topic, Target type) {
    return input -> {
      input = input.trim();
      // it is a hack to provide ability to sent empty array as a key/value
      if (input.length() == 0) {
        return new byte[]{};
      }
      return hexFormat.parseHex(input);
    };
  }

  @Override
  public Deserializer deserializer(String topic, Target type) {
    return (headers, data) ->
        new DeserializeResult(
            hexFormat.formatHex(data),
            DeserializeResult.Type.STRING,
            Map.of()
        );
  }
}
