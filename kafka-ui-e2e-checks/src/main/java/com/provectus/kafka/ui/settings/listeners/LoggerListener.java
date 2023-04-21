package com.provectus.kafka.ui.settings.listeners;

import lombok.extern.slf4j.Slf4j;
import org.testng.ITestResult;
import org.testng.TestListenerAdapter;

@Slf4j
public class LoggerListener extends TestListenerAdapter {

  @Override
  public void onTestStart(final ITestResult testResult) {
    log.info(String.format("\n------------------------------------------------------------------------ "
            + "\nTEST STARTED: %s.%s \n------------------------------------------------------------------------ \n",
        testResult.getInstanceName(), testResult.getName()));
  }

  @Override
  public void onTestSuccess(final ITestResult testResult) {
    log.info(String.format("\n------------------------------------------------------------------------ "
            + "\nTEST PASSED: %s.%s \n------------------------------------------------------------------------ \n",
        testResult.getInstanceName(), testResult.getName()));
  }

  @Override
  public void onTestFailure(final ITestResult testResult) {
    log.info(String.format("\n------------------------------------------------------------------------ "
            + "\nTEST FAILED: %s.%s \n------------------------------------------------------------------------ \n",
        testResult.getInstanceName(), testResult.getName()));
  }

  @Override
  public void onTestSkipped(final ITestResult testResult) {
    log.info(String.format("\n------------------------------------------------------------------------ "
            + "\nTEST SKIPPED: %s.%s \n------------------------------------------------------------------------ \n",
        testResult.getInstanceName(), testResult.getName()));
  }
}
