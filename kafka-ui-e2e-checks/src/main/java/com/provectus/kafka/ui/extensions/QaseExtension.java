package com.provectus.kafka.ui.extensions;

import com.provectus.kafka.ui.utils.qaseIO.TestCaseGenerator;
import io.qase.api.QaseClient;
import io.qase.api.StepStorage;
import io.qase.api.exceptions.QaseException;
import io.qase.client.ApiClient;
import io.qase.client.api.ResultsApi;
import io.qase.client.model.ResultCreate;
import io.qase.client.model.ResultCreate.StatusEnum;
import io.qase.client.model.ResultCreateSteps;
import lombok.extern.slf4j.Slf4j;
import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.engine.TestSource;
import org.junit.platform.engine.support.descriptor.MethodSource;
import org.junit.platform.launcher.TestExecutionListener;
import org.junit.platform.launcher.TestIdentifier;

import javax.annotation.Nullable;
import java.lang.reflect.Method;
import java.time.Duration;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import static io.qase.api.QaseClient.getConfig;
import static io.qase.api.utils.IntegrationUtils.getCaseId;
import static io.qase.api.utils.IntegrationUtils.getStacktrace;
import static org.junit.platform.engine.TestExecutionResult.Status.SUCCESSFUL;

@Slf4j
public class QaseExtension implements TestExecutionListener{

    private final ApiClient apiClient = QaseClient.getApiClient();
    private final ResultsApi resultsApi = new ResultsApi(apiClient);
    private final Map<TestIdentifier, Long> startTime = new ConcurrentHashMap<>();


 /*   If you want to run tests with integration Qase.io uncomment static block and set needed parameters
            (TOKEN, RUN_ID for existing Run or RUN_NAME if you want that new test run will be created in qase.io*/

/*    static {
        System.setProperty("QASE_ENABLE", "true");
        System.setProperty("QASE_PROJECT_CODE", "KAFKAUI");
        //System.setProperty("QASE_RUN_ID", "");
        //   System.setProperty("QASE_RUN_NAME", "Automation run " + new SimpleDateFormat("dd/MM/yyyy HH:mm:ss").format(new Date()));
        System.setProperty("QASE_API_TOKEN", "");
        System.setProperty("QASE_USE_BULK", "false");
    }*/


    @Override
    public void executionStarted(TestIdentifier testIdentifier) {
        if (QaseClient.isEnabled() && testIdentifier.isTest()) {
            startTime.put(testIdentifier, System.currentTimeMillis());
        }
    }

    @Override
    public void executionFinished(TestIdentifier testIdentifier, TestExecutionResult testExecutionResult) {
        TestSource testSource = testIdentifier.getSource().orElse(null);
        Method testMethod = null;
        if (testSource instanceof MethodSource) {
            testMethod = getMethod((MethodSource) testSource);
        }
        if (!testIdentifier.isTest() || !QaseClient.isEnabled()
                || !startTime.containsKey(testIdentifier)) {
            if (testIdentifier.isTest()) {
                TestCaseGenerator.createTestCaseIfNotExists(testMethod);
            }
            return;
        }
        Duration duration = Duration.ofMillis(System.currentTimeMillis() - this.startTime.remove(testIdentifier));
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
                log.error("Method = " + testMethod.getName() +": Result not added to test Run because there is no @CaseId annotation or case not found", e);
            }
        }
    }

    private ResultCreate getResultItem(TestExecutionResult testExecutionResult, Duration timeSpent, Method testMethod) {
        String testCaseTitle = TestCaseGenerator.generateTestCaseTitle(testMethod);
        TestCaseGenerator.createTestCaseIfNotExists(testMethod);
        Long caseId = getCaseId(testMethod);
        Map<Long, String> cases = TestCaseGenerator.getTestCasesTitleAndId();

        if (caseId == null || !TestCaseGenerator.isCaseIdPresentInQaseIo(testMethod)) {
            for (Map.Entry<Long, String> map : cases.entrySet()) {
                if (map.getValue().matches(testCaseTitle)) {
                    caseId = map.getKey();
                    log.info("There is no annotation @CaseId but there is test case with title '" + testCaseTitle + "' and with id = " + caseId
                    + " that will be added to test Run");
                }
            }
        }

        StatusEnum status =
                testExecutionResult.getStatus() == SUCCESSFUL ? StatusEnum.PASSED : StatusEnum.FAILED;
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
