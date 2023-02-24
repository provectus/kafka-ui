package com.provectus.kafka.ui.serdes.builtin;

import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;

public class StringSerde implements BuiltInSerde {

  public static String name() {
    return "String";
  }

  private Charset encoding = StandardCharsets.UTF_8;

  @Override
  public void configure(PropertyResolver serdeProperties,
                        PropertyResolver kafkaClusterProperties,
                        PropertyResolver globalProperties) {
    serdeProperties.getProperty("encoding", String.class)
        .map(Charset::forName)
        .ifPresent(e -> StringSerde.this.encoding = e);
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
    return input -> input.getBytes(encoding);
  }

  @Override
  public Deserializer deserializer(String topic, Target type) {
    return (headers, data) ->
        new DeserializeResult(
            new String(data, encoding),
            DeserializeResult.Type.STRING,
            Map.of()
        );
  }

}
