package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.api.model.CompatibilityLevel;
import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.models.Schema;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.Suite;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qase.api.annotation.CaseId;
import lombok.SneakyThrows;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.*;

import java.util.ArrayList;
import java.util.List;

import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.SCHEMA_REGISTRY;
import static com.provectus.kafka.ui.settings.Source.CLUSTER_NAME;
import static com.provectus.kafka.ui.utilities.FileUtils.fileToString;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class SchemasTests extends BaseTest {
    private static final long SUITE_ID = 11;
    private static final String SUITE_TITLE = "Schema Registry";
    private static final List<Schema> SCHEMA_LIST = new ArrayList<>();
    private static final Schema AVRO_API = Schema.createSchemaAvro();
    private static final Schema JSON_API = Schema.createSchemaJson();
    private static final Schema PROTOBUF_API = Schema.createSchemaProtobuf();

    @BeforeAll
    @SneakyThrows
    public void beforeAll() {
        SCHEMA_LIST.addAll(List.of(AVRO_API, JSON_API, PROTOBUF_API));
        SCHEMA_LIST.forEach(schema -> apiHelper.createSchema(CLUSTER_NAME, schema));
    }

    @DisplayName("should create AVRO schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(43)
    @Test
    @Order(1)
    void createSchemaAvro() {
        Schema schemaAvro = Schema.createSchemaAvro();
        naviSideBar
                .openSideMenu(SCHEMA_REGISTRY);
        schemaRegistryList
                .waitUntilScreenReady()
                .clickCreateSchema();
        schemaCreateForm
                .setSubjectName(schemaAvro.getName())
                .setSchemaField(fileToString(schemaAvro.getValuePath()))
                .selectSchemaTypeFromDropdown(schemaAvro.getType())
                .clickSubmitBtn();
        schemaDetails
                .waitUntilScreenReady();
        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(schemaDetails.isSchemaHeaderVisible(schemaAvro.getName())).as("isSchemaHeaderVisible()").isTrue();
        softly.assertThat(schemaDetails.getSchemaType()).as("getSchemaType()").isEqualTo(schemaAvro.getType().getValue());
        softly.assertThat(schemaDetails.getCompatibility()).as("getCompatibility()").isEqualTo(CompatibilityLevel.CompatibilityEnum.BACKWARD.getValue());
        softly.assertAll();
        naviSideBar
                .openSideMenu(SCHEMA_REGISTRY);
        schemaRegistryList
                .waitUntilScreenReady();
        Assertions.assertTrue(schemaRegistryList.isSchemaVisible(AVRO_API.getName()),"isSchemaVisible()");
        SCHEMA_LIST.add(schemaAvro);
    }

    @DisplayName("should update AVRO schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(186)
    @Test
    @Order(2)
    void updateSchemaAvro() {
        AVRO_API.setValuePath(System.getProperty("user.dir") + "/src/main/resources/testData/schema_avro_for_update.json");
        naviSideBar
                .openSideMenu(SCHEMA_REGISTRY);
        schemaRegistryList
                .waitUntilScreenReady()
                .openSchema(AVRO_API.getName());
        schemaDetails
                .waitUntilScreenReady()
                .openEditSchema();
        schemaCreateForm
                .waitUntilScreenReady();
        Assertions.assertTrue(schemaCreateForm.isSchemaDropDownDisabled(),"isSchemaDropDownDisabled()");
        schemaCreateForm
                .selectCompatibilityLevelFromDropdown(CompatibilityLevel.CompatibilityEnum.NONE)
                .setNewSchemaValue(fileToString(AVRO_API.getValuePath()))
                .clickSubmitBtn();
        schemaDetails
                .waitUntilScreenReady();
        Assertions.assertEquals(CompatibilityLevel.CompatibilityEnum.NONE.toString(), schemaDetails.getCompatibility(), "getCompatibility()");
    }

    @DisplayName("should delete AVRO schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(187)
    @Test
    @Order(3)
    void deleteSchemaAvro() {
        naviSideBar
                .openSideMenu(SCHEMA_REGISTRY);
        schemaRegistryList
                .waitUntilScreenReady()
                .openSchema(AVRO_API.getName());
        schemaDetails
                .waitUntilScreenReady()
                .removeSchema();
        schemaRegistryList
                .waitUntilScreenReady();
        Assertions.assertFalse(schemaRegistryList.isSchemaVisible(AVRO_API.getName()),"isSchemaVisible()");
        SCHEMA_LIST.remove(AVRO_API);
    }

    @DisplayName("should create JSON schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(89)
    @Test
    @Order(4)
    void createSchemaJson() {
        Schema schemaJson = Schema.createSchemaJson();
        naviSideBar
                .openSideMenu(SCHEMA_REGISTRY);
        schemaRegistryList
                .waitUntilScreenReady()
                .clickCreateSchema();
        schemaCreateForm
                .setSubjectName(schemaJson.getName())
                .setSchemaField(fileToString(schemaJson.getValuePath()))
                .selectSchemaTypeFromDropdown(schemaJson.getType())
                .clickSubmitBtn();
        schemaDetails
                .waitUntilScreenReady();
        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(schemaDetails.isSchemaHeaderVisible(schemaJson.getName())).as("isSchemaHeaderVisible()").isTrue();
        softly.assertThat(schemaDetails.getSchemaType()).as("getSchemaType()").isEqualTo(schemaJson.getType().getValue());
        softly.assertThat(schemaDetails.getCompatibility()).as("getCompatibility()").isEqualTo(CompatibilityLevel.CompatibilityEnum.BACKWARD.getValue());
        softly.assertAll();
        naviSideBar
                .openSideMenu(SCHEMA_REGISTRY);
        schemaRegistryList
                .waitUntilScreenReady();
        Assertions.assertTrue(schemaRegistryList.isSchemaVisible(JSON_API.getName()),"isSchemaVisible()");
        SCHEMA_LIST.add(schemaJson);
    }

    @DisplayName("should delete JSON schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(189)
    @Test
    @Order(5)
    void deleteSchemaJson() {
        naviSideBar
                .openSideMenu(SCHEMA_REGISTRY);
        schemaRegistryList
                .waitUntilScreenReady()
                .openSchema(JSON_API.getName());
        schemaDetails
                .waitUntilScreenReady()
                .removeSchema();
        schemaRegistryList
                .waitUntilScreenReady();
        Assertions.assertFalse(schemaRegistryList.isSchemaVisible(JSON_API.getName()),"isSchemaVisible()");
        SCHEMA_LIST.remove(JSON_API);
    }

    @DisplayName("should create PROTOBUF schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(91)
    @Test
    @Order(6)
    void createSchemaProtobuf() {
        Schema schemaProtobuf = Schema.createSchemaProtobuf();
        naviSideBar
                .openSideMenu(SCHEMA_REGISTRY);
        schemaRegistryList
                .waitUntilScreenReady()
                .clickCreateSchema();
        schemaCreateForm
                .setSubjectName(schemaProtobuf.getName())
                .setSchemaField(fileToString(schemaProtobuf.getValuePath()))
                .selectSchemaTypeFromDropdown(schemaProtobuf.getType())
                .clickSubmitBtn();
        schemaDetails
                .waitUntilScreenReady();
        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(schemaDetails.isSchemaHeaderVisible(schemaProtobuf.getName())).as("isSchemaHeaderVisible()").isTrue();
        softly.assertThat(schemaDetails.getSchemaType()).as("getSchemaType()").isEqualTo(schemaProtobuf.getType().getValue());
        softly.assertThat(schemaDetails.getCompatibility()).as("getCompatibility()").isEqualTo(CompatibilityLevel.CompatibilityEnum.BACKWARD.getValue());
        softly.assertAll();
        naviSideBar
                .openSideMenu(SCHEMA_REGISTRY);
        schemaRegistryList
                .waitUntilScreenReady();
        Assertions.assertTrue(schemaRegistryList.isSchemaVisible(PROTOBUF_API.getName()),"isSchemaVisible()");
        SCHEMA_LIST.add(schemaProtobuf);
    }

    @DisplayName("should delete PROTOBUF schema")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(223)
    @Test
    @Order(7)
    void deleteSchemaProtobuf() {
        naviSideBar
                .openSideMenu(SCHEMA_REGISTRY);
        schemaRegistryList
                .waitUntilScreenReady()
                .openSchema(PROTOBUF_API.getName());
        schemaDetails
                .waitUntilScreenReady()
                .removeSchema();
        schemaRegistryList
                .waitUntilScreenReady();
        Assertions.assertFalse(schemaRegistryList.isSchemaVisible(PROTOBUF_API.getName()),"isSchemaVisible()");
        SCHEMA_LIST.remove(PROTOBUF_API);
    }

    @AfterAll
    public void afterAll() {
        SCHEMA_LIST.forEach(schema -> apiHelper.deleteSchema(CLUSTER_NAME, schema.getName()));
    }
}
