package com.provectus.kafka.ui.newserde.impl;

import com.provectus.kafka.ui.newserde.spi.DeserializeResult;
import com.provectus.kafka.ui.newserde.spi.PropertyResolver;
import com.provectus.kafka.ui.newserde.spi.SchemaDescription;
import com.provectus.kafka.ui.newserde.spi.Serde;
import java.nio.charset.Charset;
import java.util.Map;
import java.util.Optional;

public class StringSerde implements Serde {

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
  public Optional<SchemaDescription> getSchema(String topic, boolean isKey) {
    return Optional.empty();
  }

  @Override
  public boolean canDeserialize(String topic, boolean isKey) {
    return true;
  }

  @Override
  public boolean canSerialize(String topic, boolean isKey) {
    return true;
  }

  @Override
  public Serializer serializer(String topic, boolean isKey) {
    return (topic1, headers, input) -> input.getBytes(isKey ? keyEncoding : valueEncoding);
  }

  @Override
  public Deserializer deserializer(String topic, boolean isKey) {
    return (topic1, headers, data) ->
        new DeserializeResult(
            new String(data, isKey ? keyEncoding : valueEncoding),
            Map.of()
        );
  }
}
