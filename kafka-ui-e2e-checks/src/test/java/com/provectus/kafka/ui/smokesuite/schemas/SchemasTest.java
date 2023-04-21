package com.provectus.kafka.ui.smokesuite.schemas;

import static com.provectus.kafka.ui.utilities.FileUtils.fileToString;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.api.model.CompatibilityLevel;
import com.provectus.kafka.ui.models.Schema;
import io.qase.api.annotation.QaseId;
import java.util.ArrayList;
import java.util.List;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

public class SchemasTest extends BaseTest {

  private static final List<Schema> SCHEMA_LIST = new ArrayList<>();
  private static final Schema AVRO_API = Schema.createSchemaAvro();
  private static final Schema JSON_API = Schema.createSchemaJson();
  private static final Schema PROTOBUF_API = Schema.createSchemaProtobuf();

  @BeforeClass(alwaysRun = true)
  public void beforeClass() {
    SCHEMA_LIST.addAll(List.of(AVRO_API, JSON_API, PROTOBUF_API));
    SCHEMA_LIST.forEach(schema -> apiService.createSchema(schema));
  }

  @QaseId(43)
  @Test(priority = 1)
  public void createSchemaAvro() {
    Schema schemaAvro = Schema.createSchemaAvro();
    navigateToSchemaRegistry();
    schemaRegistryList
        .clickCreateSchema();
    schemaCreateForm
        .setSubjectName(schemaAvro.getName())
        .setSchemaField(fileToString(schemaAvro.getValuePath()))
        .selectSchemaTypeFromDropdown(schemaAvro.getType())
        .clickSubmitButton();
    schemaDetails
        .waitUntilScreenReady();
    SoftAssert softly = new SoftAssert();
    softly.assertTrue(schemaDetails.isSchemaHeaderVisible(schemaAvro.getName()), "isSchemaHeaderVisible()");
    softly.assertEquals(schemaDetails.getSchemaType(), schemaAvro.getType().getValue(), "getSchemaType()");
    softly.assertEquals(schemaDetails.getCompatibility(), CompatibilityLevel.CompatibilityEnum.BACKWARD.getValue(),
        "getCompatibility()");
    softly.assertAll();
    navigateToSchemaRegistry();
    Assert.assertTrue(schemaRegistryList.isSchemaVisible(AVRO_API.getName()), "isSchemaVisible()");
    SCHEMA_LIST.add(schemaAvro);
  }

  @QaseId(186)
  @Test(priority = 2)
  public void updateSchemaAvro() {
    AVRO_API.setValuePath(
        System.getProperty("user.dir") + "/src/main/resources/testData/schemas/schema_avro_for_update.json");
    navigateToSchemaRegistryAndOpenDetails(AVRO_API.getName());
    schemaDetails
        .openEditSchema();
    schemaCreateForm
        .waitUntilScreenReady();
    verifyElementsCondition(schemaCreateForm.getAllDetailsPageElements(), Condition.visible);
    SoftAssert softly = new SoftAssert();
    softly.assertFalse(schemaCreateForm.isSubmitBtnEnabled(), "isSubmitBtnEnabled()");
    softly.assertFalse(schemaCreateForm.isSchemaDropDownEnabled(), "isSchemaDropDownEnabled()");
    softly.assertAll();
    schemaCreateForm
        .selectCompatibilityLevelFromDropdown(CompatibilityLevel.CompatibilityEnum.NONE)
        .setNewSchemaValue(fileToString(AVRO_API.getValuePath()))
        .clickSubmitButton();
    schemaDetails
        .waitUntilScreenReady();
    Assert.assertEquals(schemaDetails.getCompatibility(), CompatibilityLevel.CompatibilityEnum.NONE.toString(),
        "getCompatibility()");
  }

  @QaseId(44)
  @Test(priority = 3)
  public void compareVersionsOperation() {
    navigateToSchemaRegistryAndOpenDetails(AVRO_API.getName());
    int latestVersion = schemaDetails
        .waitUntilScreenReady()
        .getLatestVersion();
    schemaDetails
        .openCompareVersionMenu();
    int versionsNumberFromDdl = schemaCreateForm
        .waitUntilScreenReady()
        .openLeftVersionDdl()
        .getVersionsNumberFromList();
    Assert.assertEquals(versionsNumberFromDdl, latestVersion, "Versions number is not matched");
    schemaCreateForm
        .selectVersionFromDropDown(1);
    Assert.assertEquals(schemaCreateForm.getMarkedLinesNumber(), 42, "getAllMarkedLines()");
  }

  @QaseId(187)
  @Test(priority = 4)
  public void deleteSchemaAvro() {
    navigateToSchemaRegistryAndOpenDetails(AVRO_API.getName());
    schemaDetails
        .removeSchema();
    schemaRegistryList
        .waitUntilScreenReady();
    Assert.assertFalse(schemaRegistryList.isSchemaVisible(AVRO_API.getName()), "isSchemaVisible()");
    SCHEMA_LIST.remove(AVRO_API);
  }

  @QaseId(89)
  @Test(priority = 5)
  public void createSchemaJson() {
    Schema schemaJson = Schema.createSchemaJson();
    navigateToSchemaRegistry();
    schemaRegistryList
        .clickCreateSchema();
    schemaCreateForm
        .setSubjectName(schemaJson.getName())
        .setSchemaField(fileToString(schemaJson.getValuePath()))
        .selectSchemaTypeFromDropdown(schemaJson.getType())
        .clickSubmitButton();
    schemaDetails
        .waitUntilScreenReady();
    SoftAssert softly = new SoftAssert();
    softly.assertTrue(schemaDetails.isSchemaHeaderVisible(schemaJson.getName()), "isSchemaHeaderVisible()");
    softly.assertEquals(schemaDetails.getSchemaType(), schemaJson.getType().getValue(), "getSchemaType()");
    softly.assertEquals(schemaDetails.getCompatibility(), CompatibilityLevel.CompatibilityEnum.BACKWARD.getValue(),
        "getCompatibility()");
    softly.assertAll();
    navigateToSchemaRegistry();
    Assert.assertTrue(schemaRegistryList.isSchemaVisible(JSON_API.getName()), "isSchemaVisible()");
    SCHEMA_LIST.add(schemaJson);
  }

  @QaseId(189)
  @Test(priority = 6)
  public void deleteSchemaJson() {
    navigateToSchemaRegistryAndOpenDetails(JSON_API.getName());
    schemaDetails
        .removeSchema();
    schemaRegistryList
        .waitUntilScreenReady();
    Assert.assertFalse(schemaRegistryList.isSchemaVisible(JSON_API.getName()), "isSchemaVisible()");
    SCHEMA_LIST.remove(JSON_API);
  }

  @QaseId(91)
  @Test(priority = 7)
  public void createSchemaProtobuf() {
    Schema schemaProtobuf = Schema.createSchemaProtobuf();
    navigateToSchemaRegistry();
    schemaRegistryList
        .clickCreateSchema();
    schemaCreateForm
        .setSubjectName(schemaProtobuf.getName())
        .setSchemaField(fileToString(schemaProtobuf.getValuePath()))
        .selectSchemaTypeFromDropdown(schemaProtobuf.getType())
        .clickSubmitButton();
    schemaDetails
        .waitUntilScreenReady();
    SoftAssert softly = new SoftAssert();
    softly.assertTrue(schemaDetails.isSchemaHeaderVisible(schemaProtobuf.getName()), "isSchemaHeaderVisible()");
    softly.assertEquals(schemaDetails.getSchemaType(), schemaProtobuf.getType().getValue(), "getSchemaType()");
    softly.assertEquals(schemaDetails.getCompatibility(), CompatibilityLevel.CompatibilityEnum.BACKWARD.getValue(),
        "getCompatibility()");
    softly.assertAll();
    navigateToSchemaRegistry();
    Assert.assertTrue(schemaRegistryList.isSchemaVisible(PROTOBUF_API.getName()), "isSchemaVisible()");
    SCHEMA_LIST.add(schemaProtobuf);
  }

  @QaseId(223)
  @Test(priority = 8)
  public void deleteSchemaProtobuf() {
    navigateToSchemaRegistryAndOpenDetails(PROTOBUF_API.getName());
    schemaDetails
        .removeSchema();
    schemaRegistryList
        .waitUntilScreenReady();
    Assert.assertFalse(schemaRegistryList.isSchemaVisible(PROTOBUF_API.getName()), "isSchemaVisible()");
    SCHEMA_LIST.remove(PROTOBUF_API);
  }

  @AfterClass(alwaysRun = true)
  public void afterClass() {
    SCHEMA_LIST.forEach(schema -> apiService.deleteSchema(schema.getName()));
  }
}
