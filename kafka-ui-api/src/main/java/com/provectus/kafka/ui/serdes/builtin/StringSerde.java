package com.provectus.kafka.ui.serdes.builtin;

import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import java.nio.charset.Charset;
import java.util.Map;
import java.util.Optional;

public class StringSerde implements BuiltInSerde {

  public static String name() {
    return "String";
  }

  private Charset encoding;

  @Override
  public void configure(PropertyResolver serdeProperties,
                        PropertyResolver kafkaClusterProperties,
                        PropertyResolver globalProperties) {
    encoding = Charset.forName(
        serdeProperties.getProperty("encoding", String.class)
            .orElse("UTF8")
    );
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
    return (topic1, input) -> input.getBytes(encoding);
  }

  @Override
  public Deserializer deserializer(String topic, Type type) {
    return (topic1, headers, data) ->
        new DeserializeResult(
            new String(data, encoding),
            DeserializeResult.Type.STRING,
            Map.of()
        );
  }

}
