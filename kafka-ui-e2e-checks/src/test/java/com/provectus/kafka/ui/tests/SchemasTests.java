package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.api.model.CompatibilityLevel;
import com.provectus.kafka.ui.api.model.SchemaType;
import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.pages.MainPage;
import com.provectus.kafka.ui.pages.schema.SchemaCreateView;
import com.provectus.kafka.ui.utils.qaseIO.Status;
import com.provectus.kafka.ui.utils.qaseIO.annotation.AutomationStatus;
import io.qase.api.annotation.CaseId;
import lombok.SneakyThrows;
import org.junit.jupiter.api.*;
import com.provectus.kafka.ui.utils.qaseIO.annotation.Suite;

import java.io.IOException;

import static org.apache.kafka.common.utils.Utils.readFileAsString;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class SchemasTests extends BaseTest {

    private final long suiteId = 11;
    private final String suiteTitle = "Schema Registry";
    public static final String SECOND_LOCAL = "secondLocal";
    public static final String SCHEMA_AVRO_CREATE = "avro_schema";
    public static final String SCHEMA_JSON_CREATE = "json_schema";
    public static final String SCHEMA_PROTOBUF_CREATE = "protobuf_schema";
    public static final String SCHEMA_AVRO_API_UPDATE = "avro_schema_for_update_api";
    public static final String SCHEMA_AVRO_API = "avro_schema_api";
    public static final String SCHEMA_JSON_API = "json_schema_api";
    public static final String SCHEMA_PROTOBUF_API = "protobuf_schema_api";
    private static final String PATH_AVRO_VALUE = System.getProperty("user.dir") + "/src/test/resources/schema_avro_value.json";
    private static final String PATH_AVRO_FOR_UPDATE = System.getProperty("user.dir") + "/src/test/resources/schema_avro_for_update.json";
    private static final String PATH_PROTOBUF_VALUE = System.getProperty("user.dir") + "/src/test/resources/schema_protobuf_value.txt";
    private static final String PATH_JSON_VALUE = System.getProperty("user.dir") + "/src/test/resources/schema_Json_Value.json";

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
    void createSchemaAvro() throws IOException {
        pages.openMainPage()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateSchema()
                .setSubjectName(SCHEMA_AVRO_CREATE)
                .setSchemaField(readFileAsString(PATH_AVRO_VALUE))
                .selectSchemaTypeFromDropdown(SchemaCreateView.SchemaType.AVRO)
                .clickSubmit()
                .isOnSchemaViewPage();
        pages.mainPage
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.isSchemaVisible(SCHEMA_AVRO_CREATE);
    }

    @SneakyThrows
    @DisplayName("should update AVRO schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(186)
    @Test
    @Order(2)
    void updateSchemaAvro() {
        pages.openMainPage()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.openSchema(SCHEMA_AVRO_API_UPDATE)
                .isOnSchemaViewPage()
                .openEditSchema()
                .selectCompatibilityLevelFromDropdown(CompatibilityLevel.CompatibilityEnum.NONE)
                .setNewSchemaValue(readFileAsString(PATH_AVRO_FOR_UPDATE))
                .clickSubmit()
                .isOnSchemaViewPage()
                .isCompatibility(CompatibilityLevel.CompatibilityEnum.NONE);
    }

    @SneakyThrows
    @DisplayName("should delete AVRO schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(187)
    @Test
    @Order(3)
    void deleteSchemaAvro() {
        pages.openMainPage()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.openSchema(SCHEMA_AVRO_API)
                .isOnSchemaViewPage()
                .removeSchema()
                .isNotVisible(SCHEMA_AVRO_API);
    }

    @SneakyThrows
    @DisplayName("should create JSON schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(89)
    @Test
    @Order(4)
    void createSchemaJson() {
        pages.openMainPage()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateSchema()
                .setSubjectName(SCHEMA_JSON_CREATE)
                .setSchemaField(readFileAsString(PATH_JSON_VALUE))
                .selectSchemaTypeFromDropdown(SchemaCreateView.SchemaType.JSON)
                .clickSubmit()
                .isOnSchemaViewPage();
        pages.mainPage
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.isSchemaVisible(SCHEMA_JSON_CREATE);
    }

    @SneakyThrows
    @DisplayName("should delete JSON schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(189)
    @Test
    @Order(5)
    void deleteSchemaJson() {
        pages.openMainPage()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.openSchema(SCHEMA_JSON_API)
                .isOnSchemaViewPage()
                .removeSchema()
                .isNotVisible(SCHEMA_JSON_API);
    }

    @SneakyThrows
    @DisplayName("should create PROTOBUF schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(91)
    @Test
    @Order(6)
    void createSchemaProtobuf() {
        pages.openMainPage()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateSchema()
                .setSubjectName(SCHEMA_PROTOBUF_CREATE)
                .setSchemaField(readFileAsString(PATH_PROTOBUF_VALUE))
                .selectSchemaTypeFromDropdown(SchemaCreateView.SchemaType.PROTOBUF)
                .clickSubmit()
                .isOnSchemaViewPage();
        pages.mainPage
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.isSchemaVisible(SCHEMA_PROTOBUF_CREATE);
    }

    @SneakyThrows
    @DisplayName("should delete PROTOBUF schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(223)
    @Test
    @Order(7)
    void deleteSchemaProtobuf() {
        pages.openMainPage()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.openSchema(SCHEMA_PROTOBUF_API)
                .isOnSchemaViewPage()
                .removeSchema()
                .isNotVisible(SCHEMA_PROTOBUF_API);
    }
}
