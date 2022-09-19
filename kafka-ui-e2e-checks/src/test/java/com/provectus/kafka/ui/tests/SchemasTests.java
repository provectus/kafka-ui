package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.api.model.CompatibilityLevel;
import com.provectus.kafka.ui.api.model.SchemaType;
import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.pages.MainPage;
import com.provectus.kafka.ui.pages.schema.SchemaCreateView;
import com.provectus.kafka.ui.pages.schema.SchemaEditView;
import com.provectus.kafka.ui.utils.qaseIO.Status;
import com.provectus.kafka.ui.utils.qaseIO.annotation.AutomationStatus;
import com.provectus.kafka.ui.utils.qaseIO.annotation.Suite;
import io.qase.api.annotation.CaseId;
import org.junit.jupiter.api.*;

import static com.provectus.kafka.ui.extensions.FileUtils.fileToString;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class SchemasTests extends BaseTest {

    private final long suiteId = 11;
    private final String suiteTitle = "Schema Registry";
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
    public static void beforeAll() {
        Helpers.INSTANCE.apiHelper.createSchema(CLUSTER_NAME, SCHEMA_AVRO_API_UPDATE, SchemaType.AVRO, fileToString(PATH_AVRO_VALUE));
        Helpers.INSTANCE.apiHelper.createSchema(CLUSTER_NAME, SCHEMA_AVRO_API, SchemaType.AVRO, fileToString(PATH_AVRO_VALUE));
        Helpers.INSTANCE.apiHelper.createSchema(CLUSTER_NAME, SCHEMA_JSON_API, SchemaType.JSON, fileToString(PATH_JSON_VALUE));
        Helpers.INSTANCE.apiHelper.createSchema(CLUSTER_NAME, SCHEMA_PROTOBUF_API, SchemaType.PROTOBUF, fileToString(PATH_PROTOBUF_VALUE));
    }

    @AfterAll
    public static void afterAll() {
        Helpers.INSTANCE.apiHelper.deleteSchema(CLUSTER_NAME, SCHEMA_AVRO_CREATE);
        Helpers.INSTANCE.apiHelper.deleteSchema(CLUSTER_NAME, SCHEMA_JSON_CREATE);
        Helpers.INSTANCE.apiHelper.deleteSchema(CLUSTER_NAME, SCHEMA_PROTOBUF_CREATE);
        Helpers.INSTANCE.apiHelper.deleteSchema(CLUSTER_NAME, SCHEMA_AVRO_API_UPDATE);
        Helpers.INSTANCE.apiHelper.deleteSchema(CLUSTER_NAME, SCHEMA_AVRO_API);
        Helpers.INSTANCE.apiHelper.deleteSchema(CLUSTER_NAME, SCHEMA_JSON_API);
        Helpers.INSTANCE.apiHelper.deleteSchema(CLUSTER_NAME, SCHEMA_PROTOBUF_API);

    }

    @DisplayName("should create AVRO schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(43)
    @Test
    @Order(1)
    void createSchemaAvro() {
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateSchema()
                .setSubjectName(SCHEMA_AVRO_CREATE)
                .setSchemaField(fileToString(PATH_AVRO_VALUE))
                .selectSchemaTypeFromDropdown(SchemaCreateView.SchemaType.AVRO)
                .clickSubmit()
                .waitUntilScreenReady();
        pages.mainPage
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.isSchemaVisible(SCHEMA_AVRO_CREATE);
    }

    @DisplayName("should update AVRO schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(186)
    @Test
    @Order(2)
    void updateSchemaAvro() {
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.openSchema(SCHEMA_AVRO_API_UPDATE)
                .waitUntilScreenReady()
                .openEditSchema();
        Assertions.assertTrue(new SchemaEditView().isSchemaDropDownDisabled(),"isSchemaDropDownDisabled()");
        new SchemaEditView().selectCompatibilityLevelFromDropdown(CompatibilityLevel.CompatibilityEnum.NONE)
                .setNewSchemaValue(fileToString(PATH_AVRO_FOR_UPDATE))
                .clickSubmit()
                .waitUntilScreenReady()
                .isCompatibility(CompatibilityLevel.CompatibilityEnum.NONE);
    }

    @DisplayName("should delete AVRO schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(187)
    @Test
    @Order(3)
    void deleteSchemaAvro() {
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.openSchema(SCHEMA_AVRO_API)
                .waitUntilScreenReady()
                .removeSchema()
                .isNotVisible(SCHEMA_AVRO_API);
    }

    @DisplayName("should create JSON schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(89)
    @Test
    @Order(4)
    void createSchemaJson() {
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateSchema()
                .setSubjectName(SCHEMA_JSON_CREATE)
                .setSchemaField(fileToString(PATH_JSON_VALUE))
                .selectSchemaTypeFromDropdown(SchemaCreateView.SchemaType.JSON)
                .clickSubmit()
                .waitUntilScreenReady();
        pages.mainPage
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.isSchemaVisible(SCHEMA_JSON_CREATE);
    }

    @DisplayName("should delete JSON schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(189)
    @Test
    @Order(5)
    void deleteSchemaJson() {
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.openSchema(SCHEMA_JSON_API)
                .waitUntilScreenReady()
                .removeSchema()
                .isNotVisible(SCHEMA_JSON_API);
    }

    @DisplayName("should create PROTOBUF schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(91)
    @Test
    @Order(6)
    void createSchemaProtobuf() {
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateSchema()
                .setSubjectName(SCHEMA_PROTOBUF_CREATE)
                .setSchemaField(fileToString(PATH_PROTOBUF_VALUE))
                .selectSchemaTypeFromDropdown(SchemaCreateView.SchemaType.PROTOBUF)
                .clickSubmit()
                .waitUntilScreenReady();
        pages.mainPage
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.isSchemaVisible(SCHEMA_PROTOBUF_CREATE);
    }

    @DisplayName("should delete PROTOBUF schema")
    @Suite(suiteId = suiteId, title = suiteTitle)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(223)
    @Test
    @Order(7)
    void deleteSchemaProtobuf() {
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.openSchema(SCHEMA_PROTOBUF_API)
                .waitUntilScreenReady()
                .removeSchema()
                .isNotVisible(SCHEMA_PROTOBUF_API);
    }
}
