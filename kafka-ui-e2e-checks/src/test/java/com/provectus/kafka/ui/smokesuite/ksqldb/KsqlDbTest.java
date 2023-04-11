package com.provectus.kafka.ui.smokesuite.ksqlDb;

import static com.provectus.kafka.ui.pages.ksqldb.enums.KsqlMenuTabs.STREAMS;
import static com.provectus.kafka.ui.pages.ksqldb.enums.KsqlQueryConfig.SHOW_TABLES;
import static com.provectus.kafka.ui.pages.panels.enums.MenuItem.KSQL_DB;
import static org.apache.commons.lang3.RandomStringUtils.randomAlphabetic;

import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.pages.ksqldb.models.Stream;
import com.provectus.kafka.ui.pages.ksqldb.models.Table;
import io.qameta.allure.Step;
import io.qase.api.annotation.QaseId;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

public class KsqlDbTest extends BaseTest {

  private static final Stream DEFAULT_STREAM = new Stream()
      .setName("DEFAULT_STREAM_" + randomAlphabetic(4).toUpperCase())
      .setTopicName("DEFAULT_TOPIC_" + randomAlphabetic(4).toUpperCase());
  private static final Table FIRST_TABLE = new Table()
      .setName("FIRST_TABLE_" + randomAlphabetic(4).toUpperCase())
      .setStreamName(DEFAULT_STREAM.getName());
  private static final Table SECOND_TABLE = new Table()
      .setName("SECOND_TABLE_" + randomAlphabetic(4).toUpperCase())
      .setStreamName(DEFAULT_STREAM.getName());

  @BeforeClass(alwaysRun = true)
  public void beforeClass() {
    apiService
        .createStream(DEFAULT_STREAM)
        .createTables(FIRST_TABLE, SECOND_TABLE);
  }

  @QaseId(284)
  @Test(priority = 1)
  public void streamsAndTablesVisibilityCheck() {
    naviSideBar
        .openSideMenu(KSQL_DB);
    ksqlDbList
        .waitUntilScreenReady();
    SoftAssert softly = new SoftAssert();
    softly.assertTrue(ksqlDbList.getTableByName(FIRST_TABLE.getName()).isVisible(), "getTableByName()");
    softly.assertTrue(ksqlDbList.getTableByName(SECOND_TABLE.getName()).isVisible(), "getTableByName()");
    softly.assertAll();
    ksqlDbList
        .openDetailsTab(STREAMS)
        .waitUntilScreenReady();
    Assert.assertTrue(ksqlDbList.getStreamByName(DEFAULT_STREAM.getName()).isVisible(), "getStreamByName()");
  }

  @QaseId(276)
  @Test(priority = 2)
  public void clearEnteredQueryCheck() {
    navigateToKsqlDbAndExecuteRequest(SHOW_TABLES.getQuery());
    Assert.assertFalse(ksqlQueryForm.getEnteredQuery().isEmpty(), "getEnteredQuery()");
    ksqlQueryForm
        .clickClearBtn();
    Assert.assertTrue(ksqlQueryForm.getEnteredQuery().isEmpty(), "getEnteredQuery()");
  }

  @QaseId(41)
  @Test(priority = 3)
  public void checkShowTablesRequestExecution() {
    navigateToKsqlDbAndExecuteRequest(SHOW_TABLES.getQuery());
    SoftAssert softly = new SoftAssert();
    softly.assertTrue(ksqlQueryForm.areResultsVisible(), "areResultsVisible()");
    softly.assertTrue(ksqlQueryForm.getItemByName(FIRST_TABLE.getName()).isVisible(), "getItemByName()");
    softly.assertTrue(ksqlQueryForm.getItemByName(SECOND_TABLE.getName()).isVisible(), "getItemByName()");
    softly.assertAll();
  }

  @Step
  private void navigateToKsqlDbAndExecuteRequest(String query) {
    naviSideBar
        .openSideMenu(KSQL_DB);
    ksqlDbList
        .waitUntilScreenReady()
        .clickExecuteKsqlRequestBtn();
    ksqlQueryForm
        .waitUntilScreenReady()
        .setQuery(query)
        .clickExecuteBtn(query);
  }
}
