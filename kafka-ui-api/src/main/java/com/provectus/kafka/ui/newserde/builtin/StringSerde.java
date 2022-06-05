package com.provectus.kafka.ui.newserde.builtin;

import com.provectus.kafka.ui.newserde.spi.DeserializeResult;
import com.provectus.kafka.ui.newserde.spi.PropertyResolver;
import com.provectus.kafka.ui.newserde.spi.SchemaDescription;

import java.nio.charset.Charset;
import java.util.Map;
import java.util.Optional;

public class StringSerde implements BuiltInSerde {

  private Charset keyEncoding;
  private Charset valueEncoding;

  @Override
  public void configure(PropertyResolver serdeProperties,
                        PropertyResolver kafkaClusterProperties,
                        PropertyResolver globalProperties) {
    keyEncoding = Charset.forName(
        serdeProperties.getProperty("key.encoding", String.class)
            .orElse("UTF8")
    );
    valueEncoding = Charset.forName(
        serdeProperties.getProperty("value.encoding", String.class)
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
    return (topic1, input) -> input.getBytes(type == Type.KEY ? keyEncoding : valueEncoding);
  }

  @Override
  public Deserializer deserializer(String topic, Type type) {
    return (topic1, headers, data) ->
        new DeserializeResult(
            new String(data, type == Type.KEY ? keyEncoding : valueEncoding),
            DeserializeResult.Type.STRING,
            Map.of()
        );
  }

}
