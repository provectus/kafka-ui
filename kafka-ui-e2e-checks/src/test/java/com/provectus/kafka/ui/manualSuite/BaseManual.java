package com.provectus.kafka.ui.manualSuite;

import com.provectus.kafka.ui.settings.listeners.QaseResultListener;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Listeners;

import static com.provectus.kafka.ui.utilities.qaseUtils.QaseSetup.qaseIntegrationSetup;

@Listeners(QaseResultListener.class)
public abstract class BaseManual {

    @BeforeSuite
    public void beforeSuite() {
        qaseIntegrationSetup();
    }
}
