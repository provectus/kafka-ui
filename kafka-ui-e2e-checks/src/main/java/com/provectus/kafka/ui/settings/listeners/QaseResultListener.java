package com.provectus.kafka.ui.settings.listeners;

import static io.qase.api.utils.IntegrationUtils.getCaseId;
import static io.qase.api.utils.IntegrationUtils.getCaseTitle;
import static io.qase.api.utils.IntegrationUtils.getStacktrace;
import static io.qase.client.model.ResultCreate.StatusEnum.FAILED;
import static io.qase.client.model.ResultCreate.StatusEnum.PASSED;
import static io.qase.client.model.ResultCreate.StatusEnum.SKIPPED;

import io.qase.api.StepStorage;
import io.qase.api.config.QaseConfig;
import io.qase.api.services.QaseTestCaseListener;
import io.qase.client.model.ResultCreate;
import io.qase.client.model.ResultCreateCase;
import io.qase.client.model.ResultCreateStepsInner;
import io.qase.testng.guice.module.TestNgModule;
import java.lang.reflect.Method;
import java.util.LinkedList;
import java.util.Optional;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;
import org.testng.TestListenerAdapter;

@Slf4j
public class QaseResultListener extends TestListenerAdapter implements ITestListener {

  private static final String REPORTER_NAME = "TestNG";

  static {
    System.setProperty(QaseConfig.QASE_CLIENT_REPORTER_NAME_KEY, REPORTER_NAME);
  }

  @Getter(lazy = true, value = AccessLevel.PRIVATE)
  private final QaseTestCaseListener qaseTestCaseListener = createQaseListener();

  private static QaseTestCaseListener createQaseListener() {
    return TestNgModule.getInjector().getInstance(QaseTestCaseListener.class);
  }

  @Override
  public void onTestStart(ITestResult tr) {
    getQaseTestCaseListener().onTestCaseStarted();
    super.onTestStart(tr);
  }

  @Override
  public void onTestSuccess(ITestResult tr) {
    getQaseTestCaseListener()
        .onTestCaseFinished(resultCreate -> setupResultItem(resultCreate, tr, PASSED));
    super.onTestSuccess(tr);
  }

  @Override
  public void onTestSkipped(ITestResult tr) {
    getQaseTestCaseListener()
        .onTestCaseFinished(resultCreate -> setupResultItem(resultCreate, tr, SKIPPED));
    super.onTestSuccess(tr);
  }

  @Override
  public void onTestFailure(ITestResult tr) {
    getQaseTestCaseListener()
        .onTestCaseFinished(resultCreate -> setupResultItem(resultCreate, tr, FAILED));
    super.onTestFailure(tr);
  }

  @Override
  public void onFinish(ITestContext testContext) {
    getQaseTestCaseListener().onTestCasesSetFinished();
    super.onFinish(testContext);
  }

  private void setupResultItem(ResultCreate resultCreate, ITestResult result, ResultCreate.StatusEnum status) {
    Optional<Throwable> resultThrowable = Optional.ofNullable(result.getThrowable());
    String comment = resultThrowable
        .flatMap(throwable -> Optional.of(throwable.toString())).orElse(null);
    Boolean isDefect = resultThrowable
        .flatMap(throwable -> Optional.of(throwable instanceof AssertionError))
        .orElse(false);
    String stacktrace = resultThrowable
        .flatMap(throwable -> Optional.of(getStacktrace(throwable)))
        .orElse(null);
    Method method = result.getMethod()
        .getConstructorOrMethod()
        .getMethod();
    Long caseId = getCaseId(method);
    String caseTitle = null;
    if (caseId == null) {
      caseTitle = getCaseTitle(method);
    }
    LinkedList<ResultCreateStepsInner> steps = StepStorage.stopSteps();
    resultCreate
        ._case(caseTitle == null ? null : new ResultCreateCase().title(caseTitle))
        .caseId(caseId)
        .status(status)
        .comment(comment)
        .stacktrace(stacktrace)
        .steps(steps.isEmpty() ? null : steps)
        .defect(isDefect);
  }
}
