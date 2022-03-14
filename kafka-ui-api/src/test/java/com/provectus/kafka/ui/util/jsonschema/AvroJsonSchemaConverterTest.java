package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jsonschema.core.exceptions.ProcessingException;
import com.github.fge.jsonschema.core.report.ProcessingReport;
import com.github.fge.jsonschema.main.JsonSchemaFactory;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class AvroJsonSchemaConverterTest {
  @Test
  public void avroConvertTest() throws URISyntaxException, JsonProcessingException {
    final AvroJsonSchemaConverter converter = new AvroJsonSchemaConverter();
    URI basePath = new URI("http://example.com/");

    Schema recordSchema = (new Schema.Parser()).parse(
         " {"
            + "     \"type\": \"record\","
            + "     \"name\": \"Message\","
            + "     \"namespace\": \"com.provectus.kafka\","
            + "     \"fields\": ["
            + "         {"
            + "             \"name\": \"record\","
            + "             \"type\": {"
            + "                 \"type\": \"record\","
            + "                 \"name\": \"InnerMessage\","
            + "                 \"fields\": ["
            + "                     {"
            + "                         \"name\": \"id\","
            + "                         \"type\": \"long\""
            + "                     },"
            + "                     {"
            + "                         \"name\": \"text\","
            + "                         \"type\": \"string\""
            + "                     },"
            + "                     {"
            + "                         \"name\": \"long_text\","
            + "                         \"type\": ["
            + "                             \"null\","
            + "                             \"string\""
            + "                         ],"
            + "                         \"default\": null"
            + "                     },"
            + "                     {"
            + "                         \"name\": \"order\","
            + "                         \"type\": {"
            + "                        \"type\": \"enum\","
            + "                        \"name\": \"Suit\","
            + "                        \"symbols\": [\"SPADES\",\"HEARTS\",\"DIAMONDS\",\"CLUBS\"]"
            + "                         }"
            + "                     },"
            + "                     {"
            + "                         \"name\": \"array\","
            + "                         \"type\": {"
            + "                             \"type\": \"array\","
            + "                             \"items\": \"string\","
            + "                             \"default\": []"
            + "                         }"
            + "                     },"
            + "                     {"
            + "                         \"name\": \"map\","
            + "                         \"type\": {"
            + "                             \"type\": \"map\","
            + "                             \"values\": \"long\","
            + "                             \"default\": {}"
            + "                         }"
            + "                     }"
            + "                 ]"
            + "             }"
            + "         }"
            + "     ]"
            + " }"
    );


    String expected = "{\"$id\":\"http://example.com/Message\","
        + "\"$schema\":\"https://json-schema.org/draft/2020-12/schema\","
        + "\"type\":\"object\",\"properties\":{\"record\":"
        + "{\"$ref\":\"#/definitions/RecordInnerMessage\"}},"
        + "\"required\":[\"record\"],\"definitions\":"
        + "{\"RecordInnerMessage\":{\"type\":\"object\",\""
        + "properties\":{\"long_text\":{\"oneOf\":[{\"type\":\"null\"},"
        + "{\"type\":\"object\",\"properties\":{\"string\":"
        + "{\"type\":\"string\"}}}]},\"array\":{\"type\":\"array\",\"items\":"
        + "{\"type\":\"string\"}},\"id\":{\"type\":\"integer\"},\"text\":"
        + "{\"type\":\"string\"},\"map\":{\"type\":\"object\","
        + "\"additionalProperties\":{\"type\":\"integer\"}},"
        + "\"order\":{\"enum\":[\"SPADES\",\"HEARTS\",\"DIAMONDS\",\"CLUBS\"],"
        + "\"type\":\"string\"}},"
        + "\"required\":[\"id\",\"text\",\"order\",\"array\",\"map\"]}}}";

    final JsonSchema convertRecord = converter.convert(basePath, recordSchema);

    ObjectMapper om = new ObjectMapper();
    Assertions.assertEquals(
        om.readTree(expected),
        om.readTree(
            convertRecord.toJson()
        )
    );

  }

  @Test
  public void testNullableUnions() throws URISyntaxException, IOException, ProcessingException {
    final AvroJsonSchemaConverter converter = new AvroJsonSchemaConverter();
    URI basePath = new URI("http://example.com/");
    final ObjectMapper objectMapper = new ObjectMapper();

    Schema recordSchema = (new Schema.Parser()).parse(
        " {"
            + "     \"type\": \"record\","
            + "     \"name\": \"Message\","
            + "     \"namespace\": \"com.provectus.kafka\","
            + "     \"fields\": ["
            + "                     {"
            + "                         \"name\": \"text\","
            + "                         \"type\": ["
            + "                             \"null\","
            + "                             \"string\""
            + "                         ],"
            + "                         \"default\": null"
            + "                     },"
            + "                     {"
            + "                         \"name\": \"value\","
            + "                         \"type\": ["
            + "                             \"null\","
            + "                             \"string\","
            + "                             \"long\""
            + "                         ],"
            + "                         \"default\": null"
            + "                     }"
            + "     ]"
            + " }"
    );

    final GenericData.Record record = new GenericData.Record(recordSchema);
    record.put("text", "Hello world");
    record.put("value", 100L);
    byte[] jsonBytes = AvroSchemaUtils.toJson(record);
    String serialized = new String(jsonBytes);

    String expected =
        "{\"$id\":\"http://example.com/Message\","
        + "\"$schema\":\"https://json-schema.org/draft/2020-12/schema\","
        + "\"type\":\"object\",\"properties\":{\"text\":"
        + "{\"oneOf\":[{\"type\":\"null\"},{\"type\":\"object\","
        + "\"properties\":{\"string\":{\"type\":\"string\"}}}]},\"value\":"
        + "{\"oneOf\":[{\"type\":\"null\"},{\"type\":\"object\","
        + "\"properties\":{\"string\":{\"type\":\"string\"},\"long\":{\"type\":\"integer\"}}}]}}}";

    final JsonSchema convert = converter.convert(basePath, recordSchema);
    Assertions.assertEquals(
        objectMapper.readTree(expected),
        objectMapper.readTree(convert.toJson())
    );


    final ProcessingReport validate =
        JsonSchemaFactory.byDefault().getJsonSchema(
            objectMapper.readTree(expected)
        ).validate(
            objectMapper.readTree(serialized)
        );

    Assertions.assertTrue(validate.isSuccess());
  }
}