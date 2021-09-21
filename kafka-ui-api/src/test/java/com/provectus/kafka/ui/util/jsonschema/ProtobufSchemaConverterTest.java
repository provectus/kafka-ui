package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import java.net.URI;
import java.net.URISyntaxException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;


public class ProtobufSchemaConverterTest {

  @Test
  public void testSimpleProto() throws URISyntaxException, JsonProcessingException {

    String proto = "syntax = \"proto3\";\n"
        + "package com.acme;\n"
        + "\n"
        + "message MyRecord {\n"
        + "  string f1 = 1;\n"
        + "  OtherRecord f2 = 2;\n"
        + "  repeated OtherRecord f3 = 3;\n"
        + "}\n"
        + "\n"
        + "message OtherRecord {\n"
        + "  int32 other_id = 1;\n"
        + "  Order order = 2;\n"
        + "  oneof optionalField {"
        + "    string name = 3;"
        + "    uint64 size = 4;"
        + "  }"
        + "}\n"
        + "\n"
        + "enum Order {\n"
        + "    FIRST = 1;\n"
        + "    SECOND = 1;\n"
        + "}\n";

    String expected =
        "{\"$id\":\"http://example.com/com.acme.MyRecord\","
        + "\"$schema\":\"https://json-schema.org/draft/2020-12/schema\","
        + "\"type\":\"object\",\"properties\":{\"f1\":{\"type\":\"string\"},"
        + "\"f2\":{\"$ref\":\"#/definitions/record.com.acme.OtherRecord\"},"
        + "\"f3\":{\"type\":\"array\","
        + "\"items\":{\"$ref\":\"#/definitions/record.com.acme.OtherRecord\"}}},"
        + "\"required\":[\"f3\"],"
        + "\"definitions\":"
        + "{\"record.com.acme.OtherRecord\":"
        + "{\"type\":\"object\",\"properties\":"
        + "{\"optionalField\":{\"oneOf\":[{\"type\":\"string\"},"
        + "{\"type\":\"integer\"}]},\"other_id\":"
        + "{\"type\":\"integer\"},\"order\":{\"enum\":[\"FIRST\",\"SECOND\"],"
        + "\"type\":\"string\"}}}}}";

    ProtobufSchema protobufSchema = new ProtobufSchema(proto);

    final ProtobufSchemaConverter converter = new ProtobufSchemaConverter();
    URI basePath = new URI("http://example.com/");

    final JsonSchema convert =
        converter.convert(basePath, protobufSchema.toDescriptor("MyRecord"));

    ObjectMapper om = new ObjectMapper();
    Assertions.assertEquals(
        om.readTree(expected),
        om.readTree(
            convert.toJson(om)
        )
    );
  }
}