package com.provectus.kafka.ui.qaseSuite;

import com.provectus.kafka.ui.settings.listeners.QaseCreateListener;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Listeners;

import static com.provectus.kafka.ui.utilities.qaseUtils.QaseSetup.qaseIntegrationSetup;

@Listeners(QaseCreateListener.class)
public abstract class BaseQaseTest {

    protected static final long BROKERS_SUITE_ID = 1;
    protected static final long CONNECTORS_SUITE_ID = 10;
    protected static final long KSQL_DB_SUITE_ID = 8;
    protected static final long SANITY_SUITE_ID = 19;
    protected static final long SCHEMAS_SUITE_ID = 11;
    protected static final long TOPICS_SUITE_ID = 2;

    @BeforeSuite
    public void beforeSuite() {
        qaseIntegrationSetup();
    }
}
