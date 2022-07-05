package com.provectus.kafka.ui.extensions;

import com.provectus.kafka.ui.utils.qaseIO.MethodNameUtils;
import com.provectus.kafka.ui.utils.qaseIO.TestCaseGenerator;
import io.qase.api.QaseClient;
import io.qase.api.StepStorage;
import io.qase.api.exceptions.QaseException;
import io.qase.client.ApiClient;
import io.qase.client.api.ResultsApi;
import io.qase.client.model.ResultCreate;
import io.qase.client.model.ResultCreate.StatusEnum;
import io.qase.client.model.ResultCreateSteps;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.junit.Assert;
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
        System.setProperty("QASE_RUN_ID", "");
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
        if (!QaseClient.isEnabled() || !testIdentifier.isTest()
                || !startTime.containsKey(testIdentifier)) {
            return;
        }
        Duration duration = Duration.ofMillis(System.currentTimeMillis() - this.startTime.remove(testIdentifier));
        TestSource testSource = testIdentifier.getSource().orElse(null);
        Method testMethod = null;
        if (testSource instanceof MethodSource) {
            testMethod = getMethod((MethodSource) testSource);
        }
        sendResults(testExecutionResult, duration, testMethod);
    }

    private void sendResults(TestExecutionResult testExecutionResult, Duration timeSpent, Method testMethod) {
        if (testMethod != null) {
            ResultCreate resultCreate = getResultItem(testExecutionResult, timeSpent, testMethod);

            try {
                resultsApi.createResult(getConfig().projectCode(),
                        getConfig().runId(),
                        resultCreate);
                log.info("Results added to test run with Id = {}", getConfig().runId());
            } catch (QaseException e) {
                log.error("Results not added: ", e);
            }
        }
    }

    @SneakyThrows
    private ResultCreate getResultItem(TestExecutionResult testExecutionResult, Duration timeSpent, Method testMethod) {
        String testCaseTitle = TestCaseGenerator.getClassName(MethodSource.from(testMethod)) + "." + testMethod.getName() + " : " +
                MethodNameUtils.formatTestCaseTitle(testMethod.getName());
        TestCaseGenerator.createTestCaseIfNotExists(testMethod);
        Map<Long, String> cases = TestCaseGenerator.getTestCasesTitleAndId();

        long caseId = 0;
        for (Map.Entry<Long, String> map : cases.entrySet()) {
            if (map.getValue().matches(testCaseTitle)) {
                caseId = map.getKey();
                log.info("Test case '" + MethodNameUtils.formatTestCaseTitle(testMethod.getName()) + "' with id = " + caseId +
                        " will be added to Test Run with id = " + getConfig().runId());
            }
        }
        Assert.assertTrue(caseId != 0);
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
