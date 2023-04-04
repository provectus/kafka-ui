package com.provectus.kafka.ui.smokeSuite.ksqlDb;

import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.pages.ksqlDb.models.Stream;
import com.provectus.kafka.ui.pages.ksqlDb.models.Table;
import io.qase.api.annotation.QaseId;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

import java.util.ArrayList;
import java.util.List;

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
    private static final List<String> TOPIC_NAMES_LIST = new ArrayList<>();

    @BeforeClass(alwaysRun = true)
    public void beforeClass() {
        apiService
                .createStream(STREAM_FOR_CHECK_TABLES)
                .createTables(FIRST_TABLE, SECOND_TABLE);
        TOPIC_NAMES_LIST.addAll(List.of(STREAM_FOR_CHECK_TABLES.getTopicName(),
                FIRST_TABLE.getName(), SECOND_TABLE.getName()));
    }

    @QaseId(41)
    @Test(priority = 1)
    public void checkShowTablesRequestExecution() {
        navigateToKsqlDb();
        ksqlDbList
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
        navigateToKsqlDb();
        ksqlDbList
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

    @AfterClass(alwaysRun = true)
    public void afterClass() {
        TOPIC_NAMES_LIST.forEach(topicName -> apiService.deleteTopic(topicName));
    }
}
