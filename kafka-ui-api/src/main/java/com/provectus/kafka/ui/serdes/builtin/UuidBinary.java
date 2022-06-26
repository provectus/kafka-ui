package com.provectus.kafka.ui.serdes.builtin;

import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import java.nio.ByteBuffer;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.apache.kafka.common.header.Headers;


public class UuidBinary implements BuiltInSerde {

  public static String name() {
    return "UUIDBinary";
  }

  private boolean mostSignificantBitsFirst;

  @Override
  public void configure(PropertyResolver serdeProperties,
                        PropertyResolver kafkaClusterProperties,
                        PropertyResolver globalProperties) {
    mostSignificantBitsFirst = serdeProperties.getProperty("mostSignificantBitsFirst", Boolean.class)
        .orElse(true);
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
    return new Serializer() {
      @Override
      public byte[] serialize(String input) {
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
      }
    };
  }

  @Override
  public Deserializer deserializer(String topic, Type type) {
    return new Deserializer() {
      @Override
      public DeserializeResult deserialize(Headers headers, byte[] data) {
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
      }
    };
  }
}
