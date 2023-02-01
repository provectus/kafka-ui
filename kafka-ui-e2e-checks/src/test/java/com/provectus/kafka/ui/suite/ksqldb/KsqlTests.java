package com.provectus.kafka.ui.suite.ksqldb;

import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.KSQL_DB;
import static com.provectus.kafka.ui.pages.ksqldb.enums.KsqlQueryConfig.SHOW_TABLES;
import static org.apache.commons.lang.RandomStringUtils.randomAlphabetic;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.pages.ksqldb.models.Stream;
import com.provectus.kafka.ui.pages.ksqldb.models.Table;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.Suite;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qase.api.annotation.CaseId;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class KsqlTests extends BaseTest {
  private static final long SUITE_ID = 8;
  private static final String SUITE_TITLE = "KSQL_DB";
  private static final Stream STREAM_FOR_CHECKING_TABLES = new Stream()
      .setName("STREAM_FOR_CHECKING_TABLES_" + randomAlphabetic(4).toUpperCase())
      .setTopicName("TOPIC_FOR_STREAM_" + randomAlphabetic(4).toUpperCase());
  private static final Table FIRST_TABLE = new Table()
      .setName("FIRST_TABLE"+ randomAlphabetic(4).toUpperCase())
      .setStreamName(STREAM_FOR_CHECKING_TABLES.getName());
  private static final Table SECOND_TABLE = new Table()
      .setName("SECOND_TABLE"+ randomAlphabetic(4).toUpperCase())
      .setStreamName(STREAM_FOR_CHECKING_TABLES.getName());

  @BeforeAll
  public void beforeAll(){
    apiService
        .createStream(STREAM_FOR_CHECKING_TABLES)
        .createTables(FIRST_TABLE, SECOND_TABLE);
  }

  @DisplayName("check KSQL request execution")
  @Suite(suiteId = SUITE_ID,title = SUITE_TITLE)
  @AutomationStatus(status = Status.AUTOMATED)
  @CaseId(41)
  @Test
  @Order(1)
  public void checkingKsqlRequestExecution() {
    naviSideBar
        .openSideMenu(KSQL_DB);
    ksqlDbList
        .waitUntilScreenReady()
        .clickExecuteKsqlRequestBtn();
    ksqlQueryForm
        .waitUntilScreenReady()
        .setQuery(SHOW_TABLES.getQuery())
        .clickExecuteBtn();
    SoftAssertions softly = new SoftAssertions();
    softly.assertThat(ksqlQueryForm.getTableByName(FIRST_TABLE.getName()).isVisible())
        .as("getTableName()").isTrue();
    softly.assertThat(ksqlQueryForm.getTableByName(SECOND_TABLE.getName()).isVisible())
        .as("getTableName()").isTrue();
    softly.assertAll();
  }
}
