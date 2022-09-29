package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.URISyntaxException;
import lombok.SneakyThrows;
import org.apache.avro.Schema;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AvroJsonSchemaConverterTest {

  private AvroJsonSchemaConverter converter;
  private URI basePath;

  @BeforeEach
  void init() throws URISyntaxException {
    converter = new AvroJsonSchemaConverter();
    basePath = new URI("http://example.com/");
  }

  @Test
  void avroConvertTest() {
    String avroSchema =
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
            + " }";

    String expectedJsonSchema = "{ "
        + "  \"$id\" : \"http://example.com/Message\", "
        + "  \"$schema\" : \"https://json-schema.org/draft/2020-12/schema\", "
        + "  \"type\" : \"object\", "
        + "  \"properties\" : { "
        + "    \"record\" : { \"$ref\" : \"#/definitions/com.provectus.kafka.InnerMessage\" } "
        + "  }, "
        + "  \"required\" : [ \"record\" ], "
        + "  \"definitions\" : { "
        + "    \"com.provectus.kafka.Message\" : { \"$ref\" : \"#\" }, "
        + "    \"com.provectus.kafka.InnerMessage\" : { "
        + "      \"type\" : \"object\", "
        + "      \"properties\" : { "
        + "        \"long_text\" : { "
        + "          \"oneOf\" : [ { "
        + "            \"type\" : \"null\" "
        + "          }, { "
        + "            \"type\" : \"object\", "
        + "            \"properties\" : { "
        + "              \"string\" : { "
        + "                \"type\" : \"string\" "
        + "              } "
        + "            } "
        + "          } ] "
        + "        }, "
        + "        \"array\" : { "
        + "          \"type\" : \"array\", "
        + "          \"items\" : { \"type\" : \"string\" } "
        + "        }, "
        + "        \"id\" : { \"type\" : \"integer\" }, "
        + "        \"text\" : { \"type\" : \"string\" }, "
        + "        \"map\" : { "
        + "          \"type\" : \"object\", "
        + "          \"additionalProperties\" : { \"type\" : \"integer\" } "
        + "        }, "
        + "        \"order\" : { "
        + "          \"enum\" : [ \"SPADES\", \"HEARTS\", \"DIAMONDS\", \"CLUBS\" ], "
        + "          \"type\" : \"string\" "
        + "        } "
        + "      }, "
        + "      \"required\" : [ \"id\", \"text\", \"order\", \"array\", \"map\" ] "
        + "    } "
        + "  } "
        + "}";

    convertAndCompare(expectedJsonSchema, avroSchema);
  }

  @Test
  void testNullableUnions()  {
    String avroSchema =
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
            + " }";

    String expectedJsonSchema =
        "{\"$id\":\"http://example.com/Message\","
        + "\"$schema\":\"https://json-schema.org/draft/2020-12/schema\","
        + "\"type\":\"object\",\"properties\":{\"text\":"
        + "{\"oneOf\":[{\"type\":\"null\"},{\"type\":\"object\","
        + "\"properties\":{\"string\":{\"type\":\"string\"}}}]},\"value\":"
        + "{\"oneOf\":[{\"type\":\"null\"},{\"type\":\"object\","
        + "\"properties\":{\"string\":{\"type\":\"string\"},\"long\":{\"type\":\"integer\"}}}]}},"
        + "\"definitions\" : { \"com.provectus.kafka.Message\" : { \"$ref\" : \"#\" }}}";

    convertAndCompare(expectedJsonSchema, avroSchema);
  }

  @Test
  void testRecordReferences() {
    String avroSchema =
        "{\n"
            + "    \"type\": \"record\", "
            + "    \"namespace\": \"n.s\", "
            + "    \"name\": \"RootMsg\", "
            + "    \"fields\":\n"
            + "    [ "
            + "        { "
            + "            \"name\": \"inner1\", "
            + "            \"type\": { "
            + "                \"type\": \"record\", "
            + "                \"name\": \"Inner\", "
            + "                \"fields\": [ { \"name\": \"f1\", \"type\": \"double\" } ] "
            + "            } "
            + "        }, "
            + "        { "
            + "            \"name\": \"inner2\", "
            + "            \"type\": { "
            + "                \"type\": \"record\", "
            + "                \"namespace\": \"n.s2\", "
            + "                \"name\": \"Inner\", "
            + "                \"fields\": "
            + "                [ { \"name\": \"f1\", \"type\": \"double\" } ] "
            + "            } "
            + "        }, "
            + "        { "
            + "            \"name\": \"refField\", "
            + "            \"type\": [ \"null\", \"Inner\", \"n.s2.Inner\", \"RootMsg\" ] "
            + "        } "
            + "    ] "
            + "}";

    String expectedJsonSchema = "{ "
        + "  \"$id\" : \"http://example.com/RootMsg\", "
        + "  \"$schema\" : \"https://json-schema.org/draft/2020-12/schema\", "
        + "  \"type\" : \"object\", "
        + "  \"properties\" : { "
        + "    \"inner1\" : { \"$ref\" : \"#/definitions/n.s.Inner\" }, "
        + "    \"inner2\" : { \"$ref\" : \"#/definitions/n.s2.Inner\" }, "
        + "    \"refField\" : { "
        + "      \"oneOf\" : [  "
        + "      { "
        + "        \"type\" : \"null\" "
        + "      },  "
        + "      { "
        + "        \"type\" : \"object\", "
        + "        \"properties\" : { "
        + "          \"n.s.RootMsg\" : { \"$ref\" : \"#/definitions/n.s.RootMsg\" }, "
        + "          \"n.s2.Inner\" : { \"$ref\" : \"#/definitions/n.s2.Inner\" }, "
        + "          \"n.s.Inner\" : { \"$ref\" : \"#/definitions/n.s.Inner\" } "
        + "        } "
        + "      } ] "
        + "    } "
        + "  }, "
        + "  \"required\" : [ \"inner1\", \"inner2\" ], "
        + "  \"definitions\" : { "
        + "    \"n.s.RootMsg\" : { \"$ref\" : \"#\" }, "
        + "    \"n.s2.Inner\" : { "
        + "      \"type\" : \"object\", "
        + "      \"properties\" : { \"f1\" : { \"type\" : \"number\" } }, "
        + "      \"required\" : [ \"f1\" ] "
        + "    }, "
        + "    \"n.s.Inner\" : { "
        + "      \"type\" : \"object\", "
        + "      \"properties\" : { \"f1\" : { \"type\" : \"number\" } }, "
        + "      \"required\" : [ \"f1\" ] "
        + "    } "
        + "  } "
        + "}";

    convertAndCompare(expectedJsonSchema, avroSchema);
  }

  @SneakyThrows
  private void convertAndCompare(String expectedJsonSchema, String sourceAvroSchema) {
    var parseAvroSchema = new Schema.Parser().parse(sourceAvroSchema);
    var converted = converter.convert(basePath, parseAvroSchema).toJson();
    var objectMapper = new ObjectMapper();
    Assertions.assertEquals(
        objectMapper.readTree(expectedJsonSchema),
        objectMapper.readTree(converted)
    );
  }

}