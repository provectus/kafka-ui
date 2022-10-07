package com.provectus.kafka.ui.utilities.qaseIoUtils;

import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.Suite;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qase.api.QaseClient;
import io.qase.api.annotation.CaseId;
import io.qase.client.ApiClient;
import io.qase.client.api.CasesApi;
import io.qase.client.model.*;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.junit.Assert;
import org.junit.platform.engine.support.descriptor.MethodSource;

import java.lang.reflect.Method;
import java.util.*;

import static io.qase.api.QaseClient.getConfig;

@Slf4j
public class TestCaseGenerator {

    public static boolean FAILED = false;
    private static final ApiClient apiClient = QaseClient.getApiClient();
    private static final CasesApi casesApi = new CasesApi(apiClient);

    @SneakyThrows
    public static void createTestCaseIfNotExists(Method testMethod) {
        TestCaseCreate caseCreate = new TestCaseCreate();
        String testCaseTitle = generateTestCaseTitle(testMethod);
        if (!isMethodAnnotatedWithCaseId(testMethod) || !TestCaseGenerator.isCaseIdPresentInQaseIo(testMethod)) {
            if (!isCaseTitleExistInQaseIo(testMethod)) {
                caseCreate.setTitle(testCaseTitle);
                caseCreate.setAutomation(getAutomationStatus(testMethod));
                if (isMethodAnnotatedWithSuite(testMethod)) {
                    long suiteId = testMethod.getAnnotation(Suite.class).suiteId();
                    caseCreate.suiteId(suiteId);
                }
                Long caseId = Objects.requireNonNull(casesApi.createCase(getConfig().projectCode(), caseCreate).getResult()).getId();
                log.info("New test case = '" + testCaseTitle + "' created with id " + caseId);
            }
        }
    }

    @SneakyThrows
    public static HashMap<Long, String> getTestCasesTitleAndId() {
        HashMap<Long, String> map = new HashMap<>();
        boolean getCases = true;
        int offSet = 0;
        while (getCases) {
            getCases = false;
            TestCaseListResponse response =
                    casesApi.getCases(getConfig().projectCode(), new Filters().status(Filters.SERIALIZED_NAME_STATUS), 100, offSet);
            TestCaseListResponseAllOfResult result = response.getResult();
            Assert.assertNotNull(result);
            List<TestCase> entities = result.getEntities();
            Assert.assertNotNull(entities);
            if (entities.size() > 0) {
                for (TestCase test : entities) {
                    map.put(test.getId(), test.getTitle());
                }
                offSet = offSet + 100;
                getCases = true;
            }
        }
        return map;
    }

    public static boolean isCaseIdPresentInQaseIo(Method testMethod) {
        if (!testMethod.isAnnotationPresent(CaseId.class)) {
            return false;
        }
        long caseId = testMethod.getAnnotation(CaseId.class).value();
        HashMap<Long, String> cases = getTestCasesTitleAndId();
        String title;
        if (!cases.containsKey(caseId)) {
            FAILED = true;
            log.error("The method " + testMethod.getName() + " has wrong @CaseId =" + caseId + " that does not exist in Qase.io. " +
                    "Please put correct @CaseId");
            return false;
        } else {
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

    private static boolean isCaseTitleExistInQaseIo(Method testMethod) {
        HashMap<Long, String> cases = getTestCasesTitleAndId();
        String title = generateTestCaseTitle(testMethod);
        if (cases.containsValue(title)) {
            for (Map.Entry<Long, String> map : cases.entrySet()) {
                if (map.getValue().matches(title)) {
                    long caseId = map.getKey();
                    log.info("Test case with title '" + title + "' and id " + caseId + " exist in Qase.io. Verify that annotation @CaseId is correct");
                    return true;
                }
            }
        }
        return false;
    }

    public static int getAutomationStatus(Method testMethod) {
        if (testMethod.isAnnotationPresent(AutomationStatus.class)) {
            if (testMethod.getAnnotation(AutomationStatus.class).status().equals(Status.TO_BE_AUTOMATED))
                return 1;
            else if (testMethod.getAnnotation(AutomationStatus.class).status().equals(Status.MANUAL))
                return 0;
        }
        return 2;
    }

    private static boolean isMethodAnnotatedWithCaseId(Method testMethod) {
        if (!testMethod.isAnnotationPresent(CaseId.class)) {
            FAILED = true;
            log.error("You must put annotation @CaseId. The method " + testMethod.getName() + " is NOT annotated with @CaseId.");
            return false;
        }
        return true;
    }

    private static boolean isMethodAnnotatedWithSuite(Method testMethod) {
        if (!testMethod.isAnnotationPresent(Suite.class)) {
            log.info("The method " + testMethod.getName() + " is not annotated with @Suite and new test case will be added without suite");
            return false;
        }
        log.trace("The method is annotated with @Suite with id " + testMethod.getAnnotation(Suite.class).suiteId());
        return true;
    }

    private static boolean isMethodAnnotatedWithAutomationStatus(Method testMethod) {
        if (!testMethod.isAnnotationPresent(AutomationStatus.class)) {
            log.error("The method " + testMethod.getName() + " is NOT annotated with @AutomationStatus.");
            return false;
        }
        return true;
    }

    private static String formatTestCaseTitle(String testMethodName) {
        String[] split = StringUtils.splitByCharacterTypeCamelCase(testMethodName);
        String[] name = Arrays.stream(split).map(String::toLowerCase).toArray(String[]::new);
        String[] subarray = ArrayUtils.subarray(name, 1, name.length);
        ArrayList<String> stringList = new ArrayList<>(Arrays.asList(subarray));
        stringList.add(0, StringUtils.capitalize(name[0]));
        return StringUtils.join(stringList, " ");
    }

    public static String generateTestCaseTitle(Method testMethod) {
        return getClassName(MethodSource.from(testMethod)) + "." + testMethod.getName() + " : " +
                formatTestCaseTitle(testMethod.getName());
    }

    private static String getClassName(MethodSource testSource) {
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
