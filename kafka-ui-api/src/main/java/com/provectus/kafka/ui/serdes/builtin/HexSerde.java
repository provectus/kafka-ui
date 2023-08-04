package com.provectus.kafka.ui.serdes.builtin;

import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;

public class HexSerde implements BuiltInSerde {

  private HexFormat deserializeHexFormat;

  public static String name() {
    return "Hex";
  }

  @Override
  public void autoConfigure(PropertyResolver kafkaClusterProperties, PropertyResolver globalProperties) {
    configure(" ", true);
  }

  @Override
  public void configure(PropertyResolver serdeProperties,
                        PropertyResolver kafkaClusterProperties,
                        PropertyResolver globalProperties) {
    String delim = serdeProperties.getProperty("delimiter", String.class).orElse(" ");
    boolean uppercase = serdeProperties.getProperty("uppercase", Boolean.class).orElse(true);
    configure(delim, uppercase);
  }

  private void configure(String delim, boolean uppercase) {
    deserializeHexFormat = HexFormat.ofDelimiter(delim);
    if (uppercase) {
      deserializeHexFormat = deserializeHexFormat.withUpperCase();
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
        return new byte[] {};
      }
      return HexFormat.of().parseHex(prepareInputForParse(input));
    };
  }

  // removing most-common delimiters and prefixes
  private static String prepareInputForParse(String input) {
    return input
        .replaceAll(" ", "")
        .replaceAll("#", "")
        .replaceAll(":", "");
  }

  @Override
  public Deserializer deserializer(String topic, Target type) {
    return (headers, data) ->
        new DeserializeResult(
            deserializeHexFormat.formatHex(data),
            DeserializeResult.Type.STRING,
            Map.of()
        );
  }
}
