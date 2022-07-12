package com.provectus.kafka.ui.utils.qaseIO;

import com.provectus.kafka.ui.utils.qaseIO.annotation.Suite;
import io.qase.api.QaseClient;
import io.qase.api.annotation.CaseId;
import io.qase.client.ApiClient;
import io.qase.client.api.CasesApi;
import io.qase.client.model.Filters;
import io.qase.client.model.TestCaseCreate;
import io.qase.client.model.TestCaseListResponse;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.junit.platform.engine.support.descriptor.MethodSource;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import static io.qase.api.QaseClient.getConfig;

@Slf4j
public class TestCaseGenerator{

    private static final ApiClient apiClient = QaseClient.getApiClient();
    private static final CasesApi casesApi = new CasesApi(apiClient);

    @SneakyThrows
    public static void createTestCaseIfNotExists(Method testMethod) {
        TestCaseCreate caseCreate = new TestCaseCreate();
        String testCaseTitle = generateTestCaseTitle(testMethod);

        if (!isMethodAnnotatedWithCaseId(testMethod) || !TestCaseGenerator.isCaseIdPresentInQaseIo(testMethod)) {
            if (!isCaseTitleExistInQaseIo(testMethod)) {
                caseCreate.setTitle(testCaseTitle);
                caseCreate.setAutomation(2);
                if (isMethodAnnotatedWithSuite(testMethod)) {
                    long suiteId = testMethod.getAnnotation(Suite.class).suiteId();
                    caseCreate.suiteId(suiteId);
                }
                long caseId = casesApi.createCase(getConfig().projectCode(), caseCreate).getResult().getId();
                log.info("New test case = '" + testCaseTitle + "' created with id " + caseId);
            }
        }
    }

    @SneakyThrows
    public static HashMap<Long, String> getTestCasesTitleAndId() {
        HashMap<Long, String> map = new HashMap<>();
        TestCaseListResponse response =
                casesApi.getCases(getConfig().projectCode(), new Filters().status(Filters.SERIALIZED_NAME_STATUS), 100, 0);
        for (int i = 0; i < Objects.requireNonNull(Objects.requireNonNull(response.getResult()).getEntities()).size(); i++) {
            map.put(response.getResult().getEntities().get(i).getId(),
                    response.getResult().getEntities().get(i).getTitle());
        }
        return map;
    }

    public static boolean isCaseIdPresentInQaseIo(Method testMethod) {
        long caseId = testMethod.getAnnotation(CaseId.class).value();
        HashMap<Long, String> cases = getTestCasesTitleAndId();
        String title;
        if (!cases.containsKey(caseId)) {
            log.error("The method " + testMethod.getName() + " has wrong @CaseId =" + caseId + " that does not exist in Qase.io. " +
                    "Please put correct @CaseId");
            return false;
        }
        else {
            for (Map.Entry<Long, String> map : cases.entrySet()) {
                if (map.getKey().equals(caseId)) {
                    title = map.getValue();
                    if (!title.matches(generateTestCaseTitle(testMethod))) {
                        log.error("This CaseId =" + caseId + " belong to test with title = " + title);
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private static boolean isMethodAnnotatedWithCaseId(Method testMethod) {
        if (!testMethod.isAnnotationPresent(CaseId.class)) {
            log.error("You must put annotation @CaseId. The method " + testMethod.getName() + " is NOT annotated with @CaseId.");
            return false;
        }
        return true;
    }

    private static boolean isCaseTitleExistInQaseIo(Method testMethod) {
        HashMap<Long, String> cases = getTestCasesTitleAndId();
        String title = generateTestCaseTitle(testMethod);

        if (cases.containsValue(title)) {
            for (Map.Entry<Long, String> map : cases.entrySet()) {
                if (map.getValue().matches(title)) {
                    long caseId = map.getKey();
                    log.info("Test case with title '" + title + "' and id " + caseId + " exist in Qase.io. Verify that annotation @CaseId is correct");
                }
            }
            return true;
        }
        return false;
    }

    private static boolean isMethodAnnotatedWithSuite(Method testMethod) {
        if (!testMethod.isAnnotationPresent(Suite.class)) {
            log.info("The method " + testMethod.getName() + " is not annotated with @Suite and new test case will be added without suite");
            return false;
        }
        log.info("The method is annotated with @Suite with id " + testMethod.getAnnotation(Suite.class).suiteId());
        return true;
    }

    public static String generateTestCaseTitle(Method testMethod) {
        return getClassName(MethodSource.from(testMethod)) + "." + testMethod.getName() + " : " +
                MethodNameUtils.formatTestCaseTitle(testMethod.getName());
    }

    public static String getClassName(MethodSource testSource) {
        Class<?> testClass;
        try {
            testClass = Class.forName(testSource.getClassName());
        } catch (ClassNotFoundException e) {
            log.error(e.getMessage());
            return null;
        }
        return testClass.getSimpleName();
    }
}
