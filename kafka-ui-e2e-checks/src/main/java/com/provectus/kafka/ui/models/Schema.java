package com.provectus.kafka.ui.models;

import static org.apache.commons.lang3.RandomStringUtils.randomAlphabetic;

import com.provectus.kafka.ui.api.model.SchemaType;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class Schema {

  private static final String USER_DIR = "user.dir";

  private String name, valuePath;
  private SchemaType type;

  public static Schema createSchemaAvro() {
    return new Schema().setName("schema_avro-" + randomAlphabetic(5))
        .setType(SchemaType.AVRO)
        .setValuePath(System.getProperty(USER_DIR) + "/src/main/resources/testData/schemas/schema_avro_value.json");
  }

  public static Schema createSchemaJson() {
    return new Schema().setName("schema_json-" + randomAlphabetic(5))
        .setType(SchemaType.JSON)
        .setValuePath(System.getProperty(USER_DIR) + "/src/main/resources/testData/schemas/schema_json_Value.json");
  }

  public static Schema createSchemaProtobuf() {
    return new Schema().setName("schema_protobuf-" + randomAlphabetic(5))
        .setType(SchemaType.PROTOBUF)
        .setValuePath(
            System.getProperty(USER_DIR) + "/src/main/resources/testData/schemas/schema_protobuf_value.txt");
  }
}
