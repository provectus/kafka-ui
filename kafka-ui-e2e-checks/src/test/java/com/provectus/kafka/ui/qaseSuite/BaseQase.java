package com.provectus.kafka.ui.qaseSuite;

import com.provectus.kafka.ui.settings.listeners.QaseCreateListener;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Listeners;

import static com.provectus.kafka.ui.utilities.qaseUtils.QaseSetup.qaseIntegrationSetup;

@Listeners(QaseCreateListener.class)
public abstract class BaseQase {

    @BeforeSuite
    public void beforeSuite() {
        qaseIntegrationSetup();
    }
}
