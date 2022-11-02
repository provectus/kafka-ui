package com.provectus.kafka.ui.models;

import com.provectus.kafka.ui.api.model.SchemaType;
import lombok.Data;
import lombok.experimental.Accessors;

import static org.apache.commons.lang.RandomStringUtils.randomAlphabetic;

@Data
@Accessors(chain = true)
public class Schema {

    private String name,valuePath;
    private SchemaType type;

    public static Schema createSchemaAvro(){
        return new Schema().setName("schema_avro-" + randomAlphabetic(5))
                .setType(SchemaType.AVRO)
                .setValuePath(System.getProperty("user.dir") + "/src/main/resources/testData/schema_avro_value.json");
    }

    public static Schema createSchemaJson(){
        return new Schema().setName("schema_json-" + randomAlphabetic(5))
                .setType(SchemaType.JSON)
                .setValuePath(System.getProperty("user.dir") + "/src/main/resources/testData/schema_Json_Value.json");
    }

    public static Schema createSchemaProtobuf(){
        return new Schema().setName("schema_protobuf-" + randomAlphabetic(5))
                .setType(SchemaType.PROTOBUF)
                .setValuePath(System.getProperty("user.dir") + "/src/main/resources/testData/schema_protobuf_value.txt");
    }
}
