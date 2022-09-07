package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.api.model.CompatibilityLevel;
import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.models.Schema;
import com.provectus.kafka.ui.pages.MainPage;
import com.provectus.kafka.ui.utils.qaseIO.Status;
import com.provectus.kafka.ui.utils.qaseIO.annotation.AutomationStatus;
import com.provectus.kafka.ui.utils.qaseIO.annotation.Suite;
import io.qase.api.annotation.CaseId;
import lombok.SneakyThrows;
import org.junit.jupiter.api.*;

import static com.provectus.kafka.ui.extensions.FileUtils.fileToString;
import static com.provectus.kafka.ui.models.Schema.*;


@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class SchemasTests extends BaseTest {
//    private static Schema avroApiUpdate;
    private static Schema avroApi;
    private static Schema jsonApi;
    private static Schema protobufApi;
    private static final long SUITE_ID = 11;
    private static final String SUITE_TITLE = "Schema Registry";
    private static final String CLUSTER_NAME = "secondLocal";
    private static final String PATH_AVRO_FOR_UPDATE = System.getProperty("user.dir") + "/src/main/resources/testData/schema_avro_for_update.json";

    @BeforeAll
    @SneakyThrows
    public static void beforeAll() {
//        avroApiUpdate = getSchemaAvro().setValuePath(PATH_AVRO_FOR_UPDATE);
        avroApi = getSchemaAvro();
        jsonApi = getSchemaJson();
        protobufApi = getSchemaProtobuf();
        Helpers.INSTANCE.apiHelper.createSchema(CLUSTER_NAME, avroApi.setValuePath(PATH_AVRO_FOR_UPDATE));
        Helpers.INSTANCE.apiHelper.createSchema(CLUSTER_NAME, avroApi);
        Helpers.INSTANCE.apiHelper.createSchema(CLUSTER_NAME, jsonApi);
        Helpers.INSTANCE.apiHelper.createSchema(CLUSTER_NAME, protobufApi);
    }

    @DisplayName("should create AVRO schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(43)
    @Test
    @Order(1)
    void createSchemaAvro() {
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateSchema()
                .setSubjectName(getSchemaAvro().getName())
                .setSchemaField(fileToString(getSchemaAvro().getValuePath()))
                .selectSchemaTypeFromDropdown(getSchemaAvro().getType())
                .clickSubmit()
                .waitUntilScreenReady();
        pages.mainPage
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.isSchemaVisible(getSchemaAvro().getName());
    }

    @DisplayName("should update AVRO schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(186)
    @Test
    @Order(2)
    void updateSchemaAvro() {
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.openSchema(avroApi.getName())
                .waitUntilScreenReady()
                .openEditSchema()
                .selectCompatibilityLevelFromDropdown(CompatibilityLevel.CompatibilityEnum.NONE)
                .setNewSchemaValue(fileToString(avroApi.getValuePath()))
                .clickSubmit()
                .waitUntilScreenReady()
                .isCompatibility(CompatibilityLevel.CompatibilityEnum.NONE);
    }

    @DisplayName("should delete AVRO schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(187)
    @Test
    @Order(3)
    void deleteSchemaAvro() {
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.openSchema(avroApi.getName())
                .waitUntilScreenReady()
                .removeSchema()
                .isNotVisible(avroApi.getName());
    }

    @DisplayName("should create JSON schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(89)
    @Test
    @Order(4)
    void createSchemaJson() {
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateSchema()
                .setSubjectName(getSchemaJson().getName())
                .setSchemaField(fileToString(getSchemaJson().getValuePath()))
                .selectSchemaTypeFromDropdown(getSchemaJson().getType())
                .clickSubmit()
                .waitUntilScreenReady();
        pages.mainPage
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.isSchemaVisible(getSchemaJson().getName());
    }

    @DisplayName("should delete JSON schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(189)
    @Test
    @Order(5)
    void deleteSchemaJson() {
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.openSchema(jsonApi.getName())
                .waitUntilScreenReady()
                .removeSchema()
                .isNotVisible(jsonApi.getName());
    }

    @DisplayName("should create PROTOBUF schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(91)
    @Test
    @Order(6)
    void createSchemaProtobuf() {
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateSchema()
                .setSubjectName(getSchemaProtobuf().getName())
                .setSchemaField(fileToString(getSchemaProtobuf().getValuePath()))
                .selectSchemaTypeFromDropdown(getSchemaProtobuf().getType())
                .clickSubmit()
                .waitUntilScreenReady();
        pages.mainPage
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.isSchemaVisible(getSchemaProtobuf().getName());
    }

    @DisplayName("should delete PROTOBUF schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(223)
    @Test
    @Order(7)
    void deleteSchemaProtobuf() {
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.openSchema(protobufApi.getName())
                .waitUntilScreenReady()
                .removeSchema()
                .isNotVisible(protobufApi.getName());
    }

    @AfterAll
    public static void afterAll() {
        Helpers.INSTANCE.apiHelper.deleteSchema(CLUSTER_NAME, avroApi.setValuePath(PATH_AVRO_FOR_UPDATE).getName());
        Helpers.INSTANCE.apiHelper.deleteSchema(CLUSTER_NAME, avroApi.getName());
        Helpers.INSTANCE.apiHelper.deleteSchema(CLUSTER_NAME, jsonApi.getName());
        Helpers.INSTANCE.apiHelper.deleteSchema(CLUSTER_NAME, protobufApi.getName());
    }
}
