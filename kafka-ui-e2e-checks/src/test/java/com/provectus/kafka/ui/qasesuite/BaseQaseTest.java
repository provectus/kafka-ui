package com.provectus.kafka.ui.qasesuite;

import static com.provectus.kafka.ui.utilities.qase.QaseSetup.qaseIntegrationSetup;

import com.provectus.kafka.ui.settings.listeners.QaseCreateListener;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Listeners;

@Listeners(QaseCreateListener.class)
public abstract class BaseQaseTest {

  public static final long BROKERS_SUITE_ID = 1;
  public static final long CONNECTORS_SUITE_ID = 10;
  public static final long KSQL_DB_SUITE_ID = 8;
  public static final long SANITY_SUITE_ID = 19;
  public static final long SCHEMAS_SUITE_ID = 11;
  public static final long TOPICS_SUITE_ID = 2;
  public static final long TOPICS_CREATE_SUITE_ID = 4;
  public static final long TOPICS_PROFILE_SUITE_ID = 5;

  @BeforeSuite
  public void beforeSuite() {
    qaseIntegrationSetup();
  }
}
