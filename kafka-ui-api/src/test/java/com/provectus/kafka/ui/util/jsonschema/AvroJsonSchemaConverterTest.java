package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.URISyntaxException;
import org.apache.avro.Schema;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class AvroJsonSchemaConverterTest {
  @Test
  public void avroConvertTest() throws URISyntaxException {
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

    String expected =
            "{\"$id\":\"http://example.com/Message\","
            + "\"$schema\":\"https://json-schema.org/draft/2020-12/schema\","
            + "\"type\":\"object\",\"properties\":{\"record\":{\"$ref\":"
            + "\"#/definitions/RecordInnerMessage\"}},\"required\":[\"record\"],"
            + "\"definitions\":{\"RecordInnerMessage\":{\"type\":\"object\",\"properties\":"
            + "{\"long_text\":{\"type\":\"string\"},\"array\":{\"type\":\"array\",\"items\":"
            + "{\"type\":\"string\"}},\"id\":{\"type\":\"integer\"},\"text\":{\"type\":\"string\"},"
            + "\"map\":{\"type\":\"object\",\"additionalProperties\":{\"type\":\"integer\"}},"
            + "\"order\":{\"enum\":[\"SPADES\",\"HEARTS\",\"DIAMONDS\",\"CLUBS\"]}},"
            + "\"required\":[\"id\",\"text\",\"order\",\"array\",\"map\"]}}}";

    final JsonSchema convertRecord = converter.convert(basePath, recordSchema);
    Assertions.assertEquals(expected, convertRecord.toJson(new ObjectMapper()));

  }
}