package com.provectus.kafka.ui.smokeSuite.ksqlDb;

import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.pages.ksqlDb.models.Stream;
import com.provectus.kafka.ui.pages.ksqlDb.models.Table;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Suite;
import com.provectus.kafka.ui.utilities.qaseUtils.enums.Status;
import io.qase.api.annotation.CaseId;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.KSQL_DB;
import static com.provectus.kafka.ui.pages.ksqlDb.enums.KsqlQueryConfig.SHOW_TABLES;
import static org.apache.commons.lang3.RandomStringUtils.randomAlphabetic;

public class KsqlDbTest extends BaseTest {

    private static final long SUITE_ID = 8;
    private static final String SUITE_TITLE = "KSQL_DB";
    private static final Stream STREAM_FOR_CHECKING_TABLES = new Stream()
            .setName("STREAM_FOR_CHECKING_TABLES_" + randomAlphabetic(4).toUpperCase())
            .setTopicName("TOPIC_FOR_STREAM_" + randomAlphabetic(4).toUpperCase());
    private static final Table FIRST_TABLE = new Table()
            .setName("FIRST_TABLE" + randomAlphabetic(4).toUpperCase())
            .setStreamName(STREAM_FOR_CHECKING_TABLES.getName());
    private static final Table SECOND_TABLE = new Table()
            .setName("SECOND_TABLE" + randomAlphabetic(4).toUpperCase())
            .setStreamName(STREAM_FOR_CHECKING_TABLES.getName());

    @BeforeClass(alwaysRun = true)
    public void beforeClass() {
        apiService
                .createStream(STREAM_FOR_CHECKING_TABLES)
                .createTables(FIRST_TABLE, SECOND_TABLE);
    }

    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(41)
    @Test
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
        softly.assertTrue(ksqlQueryForm.getTableByName(FIRST_TABLE.getName()).isVisible(), "getTableName()");
        softly.assertTrue(ksqlQueryForm.getTableByName(SECOND_TABLE.getName()).isVisible(), "getTableName()");
        softly.assertAll();
    }
}
