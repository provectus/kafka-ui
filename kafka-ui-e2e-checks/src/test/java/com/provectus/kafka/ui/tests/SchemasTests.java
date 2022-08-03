package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.api.model.SchemaType;
import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.steps.kafka.schemasteps.SchemaFactory;
import com.provectus.kafka.ui.steps.kafka.schemasteps.SchemaSteps;
import com.provectus.kafka.ui.utils.qaseIO.Status;
import com.provectus.kafka.ui.utils.qaseIO.annotation.AutomationStatus;
import com.provectus.kafka.ui.utils.qaseIO.annotation.Suite;
import io.qase.api.annotation.CaseId;
import lombok.SneakyThrows;
import org.junit.jupiter.api.*;

import static com.provectus.kafka.ui.pages.MainPage.SideMenuOptions.SCHEMA_REGISTRY;
import static com.provectus.kafka.ui.steps.kafka.schemasteps.SchemaConstance.*;
import static org.apache.kafka.common.utils.Utils.readFileAsString;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class SchemasTests extends BaseTest {

    private final long suiteId = 11;
    private final String suiteTitle = "Schema Registry";

    @BeforeAll
    @SneakyThrows
    public static void beforeAll() {
        Helpers.INSTANCE.apiHelper.createSchema(SECOND_LOCAL, SCHEMA_AVRO_API_UPDATE, SchemaType.AVRO, readFileAsString(PATH_AVRO_VALUE));
        Helpers.INSTANCE.apiHelper.createSchema(SECOND_LOCAL, SCHEMA_AVRO_API, SchemaType.AVRO, readFileAsString(PATH_AVRO_VALUE));
        Helpers.INSTANCE.apiHelper.createSchema(SECOND_LOCAL, SCHEMA_JSON_API, SchemaType.JSON, readFileAsString(PATH_JSON_VALUE));
        Helpers.INSTANCE.apiHelper.createSchema(SECOND_LOCAL, SCHEMA_PROTOBUF_API, SchemaType.PROTOBUF, readFileAsString(PATH_PROTOBUF_VALUE));
    }

    @AfterAll
    @SneakyThrows
    public static void afterAll() {
        Helpers.INSTANCE.apiHelper.deleteSchema(SECOND_LOCAL, SCHEMA_AVRO_CREATE);
        Helpers.INSTANCE.apiHelper.deleteSchema(SECOND_LOCAL, SCHEMA_JSON_CREATE);
        Helpers.INSTANCE.apiHelper.deleteSchema(SECOND_LOCAL, SCHEMA_PROTOBUF_CREATE);
        Helpers.INSTANCE.apiHelper.deleteSchema(SECOND_LOCAL, SCHEMA_AVRO_API_UPDATE);
        Helpers.INSTANCE.apiHelper.deleteSchema(SECOND_LOCAL, SCHEMA_AVRO_API);
        Helpers.INSTANCE.apiHelper.deleteSchema(SECOND_LOCAL, SCHEMA_JSON_API);
        Helpers.INSTANCE.apiHelper.deleteSchema(SECOND_LOCAL, SCHEMA_PROTOBUF_API);

    }

    @DisplayName("should create AVRO schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(43)
    @Test
    @Order(1)
    void createSchemaAvro() {
        SchemaSteps.INSTANCE.openPage(SCHEMA_REGISTRY);
        SchemaSteps.createSchema(SchemaFactory.getSchema("AVRO"))
                .isSchemaVisible(SCHEMA_AVRO_CREATE);
    }

    @SneakyThrows
    @DisplayName("should update AVRO schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(186)
    @Test
    @Order(2)
    void updateSchemaAvro() {
        SchemaSteps.INSTANCE.openPage(SCHEMA_REGISTRY);
        SchemaSteps.updateSchemaAvro(SCHEMA_AVRO_API_UPDATE, PATH_AVRO_FOR_UPDATE);
    }

    @SneakyThrows
    @DisplayName("should delete AVRO schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(187)
    @Test
    @Order(3)
    void deleteSchemaAvro() {
        SchemaSteps.INSTANCE.openPage(SCHEMA_REGISTRY);
        SchemaSteps.deleteSchema(SCHEMA_AVRO_API);
        Assertions.assertTrue(SchemaSteps.schemaIsNotVisible(SCHEMA_AVRO_API));
    }

    @SneakyThrows
    @DisplayName("should create JSON schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(89)
    @Test
    @Order(4)
    void createSchemaJson() {
        SchemaSteps.INSTANCE.openPage(SCHEMA_REGISTRY);
        SchemaSteps.createSchema(SchemaFactory.getSchema("JSON"))
                .isSchemaVisible(SCHEMA_JSON_CREATE);
    }

    @SneakyThrows
    @DisplayName("should delete JSON schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(189)
    @Test
    @Order(5)
    void deleteSchemaJson() {
        SchemaSteps.INSTANCE.openPage(SCHEMA_REGISTRY);
        SchemaSteps.deleteSchema(SCHEMA_JSON_API);
        Assertions.assertTrue(SchemaSteps.schemaIsNotVisible(SCHEMA_JSON_API));
    }

    @SneakyThrows
    @DisplayName("should create PROTOBUF schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(91)
    @Test
    @Order(6)
    void createSchemaProtobuf() {
        SchemaSteps.INSTANCE.openPage(SCHEMA_REGISTRY);
        SchemaSteps.createSchema(SchemaFactory.getSchema("PROTOBUF"))
                .isSchemaVisible(SCHEMA_PROTOBUF_CREATE);
    }

    @SneakyThrows
    @DisplayName("should delete PROTOBUF schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(223)
    @Test
    @Order(7)
    void deleteSchemaProtobuf() {
        SchemaSteps.INSTANCE.openPage(SCHEMA_REGISTRY);
        SchemaSteps.deleteSchema(SCHEMA_PROTOBUF_API);
        Assertions.assertTrue(SchemaSteps.schemaIsNotVisible(SCHEMA_PROTOBUF_API));
    }
}
