package com.provectus.kafka.ui.serdes.builtin;

import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.RecordHeaders;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import java.nio.ByteBuffer;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;


public class UuidBinarySerde implements BuiltInSerde {

  public static String name() {
    return "UUIDBinary";
  }

  private boolean mostSignificantBitsFirst = true;

  @Override
  public void configure(PropertyResolver serdeProperties,
                        PropertyResolver kafkaClusterProperties,
                        PropertyResolver globalProperties) {
    serdeProperties.getProperty("mostSignificantBitsFirst", Boolean.class)
        .ifPresent(msb -> UuidBinarySerde.this.mostSignificantBitsFirst = msb);
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
      UUID uuid = UUID.fromString(input);
      ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
      if (mostSignificantBitsFirst) {
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());
      } else {
        bb.putLong(uuid.getLeastSignificantBits());
        bb.putLong(uuid.getMostSignificantBits());
      }
      return bb.array();
    };
  }

  @Override
  public Deserializer deserializer(String topic, Target type) {
    return (headers, data) -> {
      if (data.length != 16) {
        throw new ValidationException("UUID data should be 16 bytes, but it is " + data.length);
      }
      ByteBuffer bb = ByteBuffer.wrap(data);
      long msb = bb.getLong();
      long lsb = bb.getLong();
      UUID uuid = mostSignificantBitsFirst ? new UUID(msb, lsb) : new UUID(lsb, msb);
      return new DeserializeResult(
          uuid.toString(),
          DeserializeResult.Type.STRING,
          Map.of()
      );
    };
  }
}
