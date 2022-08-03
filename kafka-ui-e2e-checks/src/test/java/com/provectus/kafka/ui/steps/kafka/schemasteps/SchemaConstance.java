package com.provectus.kafka.ui.steps.kafka.schemasteps;

public class SchemaConstance {
    public static final String SECOND_LOCAL = "secondLocal";
    public static final String SCHEMA_AVRO_CREATE = "avro_schema";
    public static final String SCHEMA_JSON_CREATE = "json_schema";
    public static final String SCHEMA_PROTOBUF_CREATE = "protobuf_schema";
    public static final String SCHEMA_AVRO_API_UPDATE = "avro_schema_for_update_api";
    public static final String SCHEMA_AVRO_API = "avro_schema_api";
    public static final String SCHEMA_JSON_API = "json_schema_api";
    public static final String SCHEMA_PROTOBUF_API = "protobuf_schema_api";
    public static final String PATH_AVRO_VALUE = System.getProperty("user.dir") + "/src/test/resources/schema_avro_value.json";
    public static final String PATH_AVRO_FOR_UPDATE = System.getProperty("user.dir") + "/src/test/resources/schema_avro_for_update.json";
    public static final String PATH_PROTOBUF_VALUE = System.getProperty("user.dir") + "/src/test/resources/schema_protobuf_value.txt";
    public static final String PATH_JSON_VALUE = System.getProperty("user.dir") + "/src/test/resources/schema_Json_Value.json";
}
