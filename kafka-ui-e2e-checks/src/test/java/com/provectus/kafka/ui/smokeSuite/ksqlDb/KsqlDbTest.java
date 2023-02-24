package com.provectus.kafka.ui.smokeSuite.ksqlDb;

import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.pages.ksqlDb.models.Stream;
import com.provectus.kafka.ui.pages.ksqlDb.models.Table;
import io.qase.api.annotation.QaseId;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.KSQL_DB;
import static com.provectus.kafka.ui.pages.ksqlDb.enums.KsqlQueryConfig.SHOW_TABLES;
import static org.apache.commons.lang3.RandomStringUtils.randomAlphabetic;

public class KsqlDbTest extends BaseTest {

    private static final Stream STREAM_FOR_CHECK_TABLES = new Stream()
            .setName("STREAM_FOR_CHECK_TABLES_" + randomAlphabetic(4).toUpperCase())
            .setTopicName("TOPIC_FOR_STREAM_" + randomAlphabetic(4).toUpperCase());
    private static final Table FIRST_TABLE = new Table()
            .setName("FIRST_TABLE" + randomAlphabetic(4).toUpperCase())
            .setStreamName(STREAM_FOR_CHECK_TABLES.getName());
    private static final Table SECOND_TABLE = new Table()
            .setName("SECOND_TABLE" + randomAlphabetic(4).toUpperCase())
            .setStreamName(STREAM_FOR_CHECK_TABLES.getName());

    @BeforeClass(alwaysRun = true)
    public void beforeClass() {
        apiService
                .createStream(STREAM_FOR_CHECK_TABLES)
                .createTables(FIRST_TABLE, SECOND_TABLE);
    }

    @QaseId(41)
    @Test(priority = 1)
    public void checkShowTablesRequestExecution() {
        naviSideBar
                .openSideMenu(KSQL_DB);
        ksqlDbList
                .waitUntilScreenReady()
                .clickExecuteKsqlRequestBtn();
        ksqlQueryForm
                .waitUntilScreenReady()
                .setQuery(SHOW_TABLES.getQuery())
                .clickExecuteBtn();
        SoftAssert softly = new SoftAssert();
        softly.assertTrue(ksqlQueryForm.areResultsVisible(), "areResultsVisible()");
        softly.assertTrue(ksqlQueryForm.getTableByName(FIRST_TABLE.getName()).isVisible(), "getTableName()");
        softly.assertTrue(ksqlQueryForm.getTableByName(SECOND_TABLE.getName()).isVisible(), "getTableName()");
        softly.assertAll();
    }

    @QaseId(86)
    @Test(priority = 2)
    public void clearResultsForExecutedRequest() {
        naviSideBar
                .openSideMenu(KSQL_DB);
        ksqlDbList
                .waitUntilScreenReady()
                .clickExecuteKsqlRequestBtn();
        ksqlQueryForm
                .waitUntilScreenReady()
                .setQuery(SHOW_TABLES.getQuery())
                .clickExecuteBtn();
        SoftAssert softly = new SoftAssert();
        softly.assertTrue(ksqlQueryForm.areResultsVisible(), "areResultsVisible()");
        softly.assertAll();
        ksqlQueryForm
                .clickClearResultsBtn();
        softly.assertFalse(ksqlQueryForm.areResultsVisible(), "areResultsVisible()");
        softly.assertAll();
    }
}
