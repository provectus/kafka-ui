package com.provectus.kafka.ui.manualsuite;

import static com.provectus.kafka.ui.utilities.qase.QaseSetup.qaseIntegrationSetup;
import static com.provectus.kafka.ui.utilities.qase.enums.State.NOT_AUTOMATED;
import static com.provectus.kafka.ui.utilities.qase.enums.State.TO_BE_AUTOMATED;

import com.provectus.kafka.ui.settings.listeners.QaseResultListener;
import com.provectus.kafka.ui.utilities.qase.annotations.Automation;
import java.lang.reflect.Method;
import org.testng.SkipException;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Listeners;

@Listeners(QaseResultListener.class)
public abstract class BaseManualTest {

  @BeforeSuite
  public void beforeSuite() {
    qaseIntegrationSetup();
  }

  @BeforeMethod
  public void beforeMethod(Method method) {
    if (method.getAnnotation(Automation.class).state().equals(NOT_AUTOMATED)
        || method.getAnnotation(Automation.class).state().equals(TO_BE_AUTOMATED)) {
      throw new SkipException("Skip test exception");
    }
  }
}
