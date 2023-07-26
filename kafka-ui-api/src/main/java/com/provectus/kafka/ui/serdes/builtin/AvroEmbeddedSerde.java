package com.provectus.kafka.ui.serdes.builtin;

import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.RecordHeaders;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import java.util.Map;
import java.util.Optional;
import lombok.SneakyThrows;
import org.apache.avro.file.DataFileReader;
import org.apache.avro.file.SeekableByteArrayInput;
import org.apache.avro.generic.GenericDatumReader;

public class AvroEmbeddedSerde implements BuiltInSerde {

  public static String name() {
    return "Avro (Embedded)";
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
    return false;
  }

  @Override
  public Serializer serializer(String topic, Target type) {
    throw new IllegalStateException();
  }

  @Override
  public Deserializer deserializer(String topic, Target type) {
    return new Deserializer() {
      @SneakyThrows
      @Override
      public DeserializeResult deserialize(RecordHeaders headers, byte[] data) {
        try (var reader = new DataFileReader<>(new SeekableByteArrayInput(data), new GenericDatumReader<>())) {
          if (!reader.hasNext()) {
            // this is very strange situation, when only header present in payload
            // returning null in this case
            return new DeserializeResult(null, DeserializeResult.Type.JSON, Map.of());
          }
          Object avroObj = reader.next();
          String jsonValue = new String(AvroSchemaUtils.toJson(avroObj));
          return new DeserializeResult(jsonValue, DeserializeResult.Type.JSON, Map.of());
        }
      }
    };
  }
}
