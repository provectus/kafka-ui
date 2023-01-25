package com.provectus.kafka.ui.serdes.builtin;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.serdes.PropertyResolverImpl;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import org.apache.avro.Schema;
import org.apache.avro.file.DataFileWriter;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericDatumWriter;
import org.apache.avro.generic.GenericRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class AvroEmbeddedSerdeTest {

  private AvroEmbeddedSerde avroEmbeddedSerde;

  @BeforeEach
  void init() {
    avroEmbeddedSerde = new AvroEmbeddedSerde();
    avroEmbeddedSerde.configure(
        PropertyResolverImpl.empty(),
        PropertyResolverImpl.empty(),
        PropertyResolverImpl.empty()
    );
  }

  @ParameterizedTest
  @EnumSource
  void canDeserializeReturnsTrueForAllTargets(Serde.Target target) {
    assertThat(avroEmbeddedSerde.canDeserialize("anyTopic", target))
        .isTrue();
  }

  @ParameterizedTest
  @EnumSource
  void canSerializeReturnsFalseForAllTargets(Serde.Target target) {
    assertThat(avroEmbeddedSerde.canSerialize("anyTopic", target))
        .isFalse();
  }

  @Test
  void deserializerParsesAvroDataWithEmbeddedSchema() throws Exception {
    Schema schema = new Schema.Parser().parse("""
        {
          "type": "record",
          "name": "TestAvroRecord",
          "fields": [
            { "name": "field1", "type": "string" },
            { "name": "field2", "type": "int" }
          ]
        }
        """
    );
    GenericRecord record = new GenericData.Record(schema);
    record.put("field1", "this is test msg");
    record.put("field2", 100500);

    String jsonRecord = new String(AvroSchemaUtils.toJson(record));
    byte[] serializedRecordBytes = serializeAvroWithEmbeddedSchema(record);

    var deserializer = avroEmbeddedSerde.deserializer("anyTopic", Serde.Target.KEY);
    DeserializeResult result = deserializer.deserialize(null, serializedRecordBytes);
    assertThat(result.getType()).isEqualTo(DeserializeResult.Type.JSON);
    assertThat(result.getAdditionalProperties()).isEmpty();
    assertJsonEquals(jsonRecord, result.getResult());
  }

  private void assertJsonEquals(String expected, String actual) throws IOException {
    var mapper = new JsonMapper();
    assertThat(mapper.readTree(actual)).isEqualTo(mapper.readTree(expected));
  }

  private byte[] serializeAvroWithEmbeddedSchema(GenericRecord record) throws IOException {
    try (DataFileWriter<GenericRecord> writer = new DataFileWriter<>(new GenericDatumWriter<>());
         ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
      writer.create(record.getSchema(), baos);
      writer.append(record);
      writer.flush();
      return baos.toByteArray();
    }
  }

}
