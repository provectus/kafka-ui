package com.provectus.kafka.ui.utilities.qaseIoUtils;

import io.qase.api.QaseClient;
import io.qase.api.StepStorage;
import io.qase.api.exceptions.QaseException;
import io.qase.client.ApiClient;
import io.qase.client.api.ResultsApi;
import io.qase.client.model.ResultCreate;
import io.qase.client.model.ResultCreate.StatusEnum;
import io.qase.client.model.ResultCreateSteps;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.engine.TestSource;
import org.junit.platform.engine.support.descriptor.MethodSource;
import org.junit.platform.launcher.TestExecutionListener;
import org.junit.platform.launcher.TestIdentifier;

import javax.annotation.Nullable;
import java.lang.reflect.Method;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import static io.qase.api.QaseClient.getConfig;
import static io.qase.api.utils.IntegrationUtils.getCaseId;
import static io.qase.api.utils.IntegrationUtils.getStacktrace;
import static org.junit.platform.engine.TestExecutionResult.Status.SUCCESSFUL;

@Slf4j
public class QaseExtension implements TestExecutionListener {

    private final ApiClient apiClient = QaseClient.getApiClient();
    private final ResultsApi resultsApi = new ResultsApi(apiClient);
    private final Map<TestIdentifier, Long> testStartTimes = new ConcurrentHashMap<>();
    private static final String QASE_PROJECT = "KAFKAUI";

    static {
        String qaseApiToken = System.getProperty("QASEIO_API_TOKEN");
        if (StringUtils.isEmpty(qaseApiToken)) {
            log.warn("QASEIO_API_TOKEN system property is not set. Support for Qase will be disabled.");
            System.setProperty("QASE_ENABLE", "false");
        } else {
            System.setProperty("QASE_ENABLE", "true");
            System.setProperty("QASE_PROJECT_CODE", QASE_PROJECT);
            System.setProperty("QASE_API_TOKEN", qaseApiToken);
            System.setProperty("QASE_USE_BULK", "false");
            if ("true".equalsIgnoreCase(System.getProperty("QASEIO_CREATE_TESTRUN"))) {
              System.setProperty("QASE_RUN_NAME", "Automation run " +
                   new SimpleDateFormat("dd/MM/yyyy HH:mm:ss").format(new Date()));
            }
        }
    }

    @Override
    public void executionStarted(TestIdentifier testIdentifier) {
        if (QaseClient.isEnabled() && testIdentifier.isTest()) {
            testStartTimes.put(testIdentifier, System.currentTimeMillis());
        }
    }

    @Override
    public void executionFinished(TestIdentifier testIdentifier, TestExecutionResult testExecutionResult) {
        if (!testIdentifier.isTest() || !QaseClient.isEnabled()
                || !testStartTimes.containsKey(testIdentifier)) {
            return;
        }
        TestSource testSource = testIdentifier.getSource().orElse(null);
        Method testMethod = null;
        if (testSource instanceof MethodSource) {
            testMethod = getMethod((MethodSource) testSource);
        }
        TestCaseGenerator.createTestCaseIfNotExists(testMethod);
        Duration duration = Duration.ofMillis(System.currentTimeMillis() - this.testStartTimes.remove(testIdentifier));
        sendResults(testExecutionResult, duration, testMethod);
    }

    private void sendResults(TestExecutionResult testExecutionResult, Duration timeSpent, Method testMethod) {
        if (testMethod != null) {
            ResultCreate resultCreate = getResultItem(testExecutionResult, timeSpent, testMethod);
            try {
                resultsApi.createResult(getConfig().projectCode(),
                        getConfig().runId(),
                        resultCreate);
                log.info("Method = " + testMethod.getName() + ": Result added to test run with Id = {}", getConfig().runId());
            } catch (QaseException e) {
                log.error("Method = " + testMethod.getName() + ": Result not added to test Run because there is no @CaseId annotation or case not found", e);
            }
        }
    }

    private ResultCreate getResultItem(TestExecutionResult testExecutionResult, Duration timeSpent, Method testMethod) {
        String testCaseTitle = TestCaseGenerator.generateTestCaseTitle(testMethod);
        TestCaseGenerator.createTestCaseIfNotExists(testMethod);
        Long caseId = getCaseId(testMethod);
        Map<Long, String> cases = TestCaseGenerator.getTestCasesTitleAndId();
        StatusEnum status = StatusEnum.SKIPPED;

        if (caseId == null || !TestCaseGenerator.isCaseIdPresentInQaseIo(testMethod)) {
            for (Map.Entry<Long, String> map : cases.entrySet()) {
                if (map.getValue().matches(testCaseTitle)) {
                    caseId = map.getKey();
                    log.info("There is no annotation @CaseId but there is test case with title '" + testCaseTitle + "' and with id = " + caseId
                            + " that will be added to test Run");
                }
            }
        }

        if (TestCaseGenerator.getAutomationStatus(testMethod) == 2) {
            status = testExecutionResult.getStatus() == SUCCESSFUL ? StatusEnum.PASSED : StatusEnum.FAILED;
        }

        String comment = testExecutionResult.getThrowable()
                .flatMap(throwable -> Optional.of(throwable.toString())).orElse(null);
        Boolean isDefect = testExecutionResult.getThrowable()
                .flatMap(throwable -> Optional.of(throwable instanceof AssertionError))
                .orElse(false);
        String stacktrace = testExecutionResult.getThrowable()
                .flatMap(throwable -> Optional.of(getStacktrace(throwable))).orElse(null);
        LinkedList<ResultCreateSteps> steps = StepStorage.getSteps();
        return new ResultCreate()
                .caseId(caseId)
                .status(status)
                .timeMs(timeSpent.toMillis())
                .comment(comment)
                .stacktrace(stacktrace)
                .steps(steps.isEmpty() ? null : steps)
                .defect(isDefect);
    }

    @Nullable
    private Method getMethod(MethodSource testSource) {
        try {
            Class<?> testClass = Class.forName(testSource.getClassName());
            return Arrays.stream(testClass.getDeclaredMethods())
                    .filter(method -> MethodSource.from(method).equals(testSource))
                    .findFirst().orElse(null);
        } catch (ClassNotFoundException e) {
            log.error(e.getMessage());
            return null;
        }
    }
}
