package com.provectus.kafka.ui.serdes.builtin;

import com.google.protobuf.UnknownFieldSet;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.RecordHeaders;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import java.util.Map;
import java.util.Optional;
import lombok.SneakyThrows;

public class ProtobufRawSerde implements BuiltInSerde {

  public static String name() {
    return "ProtobufDecodeRaw";
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
  public boolean canSerialize(String topic, Target type) {
    return false;
  }

  @Override
  public boolean canDeserialize(String topic, Target type) {
    return true;
  }

  @Override
  public Serializer serializer(String topic, Target type) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Deserializer deserializer(String topic, Target type) {
    return new Deserializer() {
        @SneakyThrows
        @Override
        public DeserializeResult deserialize(RecordHeaders headers, byte[] data) {
            try {
              UnknownFieldSet unknownFields = UnknownFieldSet.parseFrom(data);
              return new DeserializeResult(unknownFields.toString(), DeserializeResult.Type.STRING, Map.of());
            } catch (Exception e) {
              throw new ValidationException(e.getMessage());
            }
        }
    };
  }
}