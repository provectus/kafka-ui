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

import java.util.ArrayList;
import java.util.List;

import static com.provectus.kafka.ui.extensions.FileUtils.fileToString;
import static com.provectus.kafka.ui.models.Schema.*;


@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class SchemasTests extends BaseTest {
    private static List<Schema> schemaList = new ArrayList<>();
    private static Schema avroApi;
    private static Schema jsonApi;
    private static Schema protobufApi;
    private static final long SUITE_ID = 11;
    private static final String SUITE_TITLE = "Schema Registry";
    private static final String PATH_AVRO_FOR_UPDATE = System.getProperty("user.dir") + "/src/main/resources/testData/schema_avro_for_update.json";

    @BeforeAll
    @SneakyThrows
    public static void beforeAll() {
        avroApi = getSchemaAvro();
        jsonApi = getSchemaJson();
        protobufApi = getSchemaProtobuf();
        schemaList.addAll(List.of(avroApi,jsonApi,protobufApi));
//        for(int i=0;i<schemaList.size();i++){
//            System.out.println(schemaList.get(i));
//        }
        schemaList.forEach(schema -> Helpers.INSTANCE.apiHelper.createSchema(CLUSTER_NAME, schema));
    }

    @DisplayName("should create AVRO schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(43)
    @Test
    @Order(1)
    void createSchemaAvro() {
        Schema schemaAvro = getSchemaAvro();
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateSchema()
                .setSubjectName(schemaAvro.getName())
                .setSchemaField(fileToString(schemaAvro.getValuePath()))
                .selectSchemaTypeFromDropdown(schemaAvro.getType())
                .clickSubmit()
                .waitUntilScreenReady();
        pages.mainPage
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.isSchemaVisible(schemaAvro.getName());
        schemaList.add(schemaAvro);
    }

    @DisplayName("should update AVRO schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(186)
    @Test
    @Order(2)
    void updateSchemaAvro() {
        avroApi.setValuePath(PATH_AVRO_FOR_UPDATE);
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
        Schema schemaJson = getSchemaJson();
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateSchema()
                .setSubjectName(schemaJson.getName())
                .setSchemaField(fileToString(schemaJson.getValuePath()))
                .selectSchemaTypeFromDropdown(schemaJson.getType())
                .clickSubmit()
                .waitUntilScreenReady();
        pages.mainPage
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.isSchemaVisible(schemaJson.getName());
        schemaList.add(schemaJson);
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
        Schema schemaProtobuf = getSchemaProtobuf();
        pages.openMainPage()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateSchema()
                .setSubjectName(schemaProtobuf.getName())
                .setSchemaField(fileToString(schemaProtobuf.getValuePath()))
                .selectSchemaTypeFromDropdown(schemaProtobuf.getType())
                .clickSubmit()
                .waitUntilScreenReady();
        pages.mainPage
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.isSchemaVisible(schemaProtobuf.getName());
        schemaList.add(schemaProtobuf);
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
    @SneakyThrows
    public static void afterAll() {
        schemaList.forEach(schema -> Helpers.INSTANCE.apiHelper.deleteSchema(CLUSTER_NAME, schema.getName()));
    }
}
