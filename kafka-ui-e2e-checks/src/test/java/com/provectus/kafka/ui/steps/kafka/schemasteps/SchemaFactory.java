package com.provectus.kafka.ui.steps.kafka.schemasteps;

import com.provectus.kafka.ui.pages.Pages;
import com.provectus.kafka.ui.pages.schema.SchemaCreateView;
import com.provectus.kafka.ui.pages.schema.SchemaView;

import java.io.IOException;
import java.util.Map;
import java.util.function.Supplier;

import static com.provectus.kafka.ui.steps.kafka.schemasteps.SchemaConstance.*;
import static org.apache.kafka.common.utils.Utils.readFileAsString;

public class SchemaFactory {

    private static final Supplier<SchemaView> schemaAvro = () -> {
        try {
            return Pages.INSTANCE.schemaRegistry.clickCreateSchema()
                    .setSubjectName(SCHEMA_AVRO_CREATE)
                    .setSchemaField(readFileAsString(PATH_AVRO_VALUE))
                    .selectSchemaTypeFromDropdown(SchemaCreateView.SchemaType.AVRO)
                    .clickSubmit();
        } catch (IOException e) {
            e.printStackTrace();
            return SchemaView.INSTANCE;
        }
    };

    private static final Supplier<SchemaView> schemaJson = () -> {
        try {
           return Pages.INSTANCE.schemaRegistry.clickCreateSchema()
                    .setSubjectName(SCHEMA_JSON_CREATE)
                    .setSchemaField(readFileAsString(PATH_JSON_VALUE))
                    .selectSchemaTypeFromDropdown(SchemaCreateView.SchemaType.JSON)
                    .clickSubmit();
        } catch (IOException e) {
            e.printStackTrace();
            return SchemaView.INSTANCE;
        }
    };

    private static final Supplier<SchemaView> schemaProtobuf = () -> {
        try {
            return Pages.INSTANCE.schemaRegistry.clickCreateSchema()
                    .setSubjectName(SCHEMA_PROTOBUF_CREATE)
                    .setSchemaField(readFileAsString(PATH_PROTOBUF_VALUE))
                    .selectSchemaTypeFromDropdown(SchemaCreateView.SchemaType.PROTOBUF)
                    .clickSubmit();
        } catch (IOException e) {
            e.printStackTrace();
            return SchemaView.INSTANCE;
        }
    };

    public static Map<String, Supplier<SchemaView>> MAP = Map.of(
            "AVRO", schemaAvro,
            "JSON", schemaJson,
            "PROTOBUF", schemaProtobuf);

    public static Supplier<SchemaView> getSchema(String schemaType){
            return MAP.get(schemaType);
    }

}
