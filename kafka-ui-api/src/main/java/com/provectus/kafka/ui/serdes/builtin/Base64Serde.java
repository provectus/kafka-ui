package com.provectus.kafka.ui.serdes.builtin;

import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

public class Base64Serde implements BuiltInSerde {

  public static String name() {
    return "Base64";
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
    var decoder = Base64.getDecoder();
    return inputString -> {
      inputString = inputString.trim();
      // it is actually a hack to provide ability to sent empty array as a key/value
      if (inputString.length() == 0) {
        return new byte[] {};
      }
      return decoder.decode(inputString);
    };
  }

  @Override
  public Deserializer deserializer(String topic, Target type) {
    var encoder = Base64.getEncoder();
    return (headers, data) ->
        new DeserializeResult(
            encoder.encodeToString(data),
            DeserializeResult.Type.STRING,
            Map.of()
        );
  }
}
