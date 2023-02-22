package com.provectus.kafka.ui.manualSuite;

import com.provectus.kafka.ui.settings.listeners.QaseResultListener;
import com.provectus.kafka.ui.utilities.qaseUtils.annotations.Automation;
import org.testng.SkipException;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Listeners;

import java.lang.reflect.Method;

import static com.provectus.kafka.ui.utilities.qaseUtils.QaseSetup.qaseIntegrationSetup;
import static com.provectus.kafka.ui.utilities.qaseUtils.enums.State.NOT_AUTOMATED;

@Listeners(QaseResultListener.class)
public abstract class BaseManual {

    @BeforeSuite
    public void beforeSuite() {
        qaseIntegrationSetup();
    }

    @BeforeMethod
    public void beforeMethod(Method method) {
        if (method.getAnnotation(Automation.class).state().equals(NOT_AUTOMATED))
            throw new SkipException("Skip test exception");
    }
}
