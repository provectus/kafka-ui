package com.provectus.kafka.ui.settings.listeners;

import static io.qase.api.utils.IntegrationUtils.getCaseTitle;

import com.provectus.kafka.ui.utilities.qase.annotations.Automation;
import com.provectus.kafka.ui.utilities.qase.annotations.Status;
import com.provectus.kafka.ui.utilities.qase.annotations.Suite;
import io.qase.api.QaseClient;
import io.qase.api.StepStorage;
import io.qase.api.annotation.QaseId;
import io.qase.client.ApiClient;
import io.qase.client.api.CasesApi;
import io.qase.client.model.GetCasesFiltersParameter;
import io.qase.client.model.ResultCreateStepsInner;
import io.qase.client.model.TestCase;
import io.qase.client.model.TestCaseCreate;
import io.qase.client.model.TestCaseCreateStepsInner;
import io.qase.client.model.TestCaseListResponse;
import io.qase.client.model.TestCaseListResponseAllOfResult;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.testng.Assert;
import org.testng.ITestListener;
import org.testng.ITestResult;
import org.testng.TestListenerAdapter;

@Slf4j
public class QaseCreateListener extends TestListenerAdapter implements ITestListener {

  private static final CasesApi QASE_API = getQaseApi();

  private static CasesApi getQaseApi() {
    ApiClient apiClient = QaseClient.getApiClient();
    apiClient.setApiKey(System.getProperty("QASEIO_API_TOKEN"));
    return new CasesApi(apiClient);
  }

  private static int getStatus(Method method) {
    if (method.isAnnotationPresent(Status.class)) {
      return method.getDeclaredAnnotation(Status.class).status().getValue();
    }
    return 1;
  }

  private static int getAutomation(Method method) {
    if (method.isAnnotationPresent(Automation.class)) {
      return method.getDeclaredAnnotation(Automation.class).state().getValue();
    }
    return 0;
  }

  @SneakyThrows
  private static HashMap<Long, String> getCaseTitlesAndIdsFromQase() {
    HashMap<Long, String> cases = new HashMap<>();
    boolean getCases = true;
    int offSet = 0;
    while (getCases) {
      getCases = false;
      TestCaseListResponse response = QASE_API.getCases(System.getProperty("QASE_PROJECT_CODE"),
          new GetCasesFiltersParameter().status(GetCasesFiltersParameter.SERIALIZED_NAME_STATUS), 100, offSet);
      TestCaseListResponseAllOfResult result = response.getResult();
      Assert.assertNotNull(result);
      List<TestCase> entities = result.getEntities();
      Assert.assertNotNull(entities);
      if (entities.size() > 0) {
        for (TestCase testCase : entities) {
          cases.put(testCase.getId(), testCase.getTitle());
        }
        offSet = offSet + 100;
        getCases = true;
      }
    }
    return cases;
  }

  private static boolean isCaseWithTitleExistInQase(Method method) {
    HashMap<Long, String> cases = getCaseTitlesAndIdsFromQase();
    String title = getCaseTitle(method);
    if (cases.containsValue(title)) {
      for (Map.Entry<Long, String> map : cases.entrySet()) {
        if (map.getValue().matches(title)) {
          long id = map.getKey();
          log.warn(String.format("Test case with @QaseTitle='%s' already exists with @QaseId=%d. "
              + "Please verify @QaseTitle annotation", title, id));
          return true;
        }
      }
    }
    return false;
  }

  @Override
  @SneakyThrows
  public void onTestSuccess(final ITestResult testResult) {
    Method method = testResult.getMethod()
        .getConstructorOrMethod()
        .getMethod();
    String title = getCaseTitle(method);
    if (!method.isAnnotationPresent(QaseId.class)) {
      if (title != null) {
        if (!isCaseWithTitleExistInQase(method)) {
          LinkedList<ResultCreateStepsInner> resultSteps = StepStorage.stopSteps();
          LinkedList<TestCaseCreateStepsInner> createSteps = new LinkedList<>();
          resultSteps.forEach(step -> {
            TestCaseCreateStepsInner caseStep = new TestCaseCreateStepsInner();
            caseStep.setAction(step.getAction());
            caseStep.setExpectedResult(step.getExpectedResult());
            createSteps.add(caseStep);
          });
          TestCaseCreate newCase = new TestCaseCreate();
          newCase.setTitle(title);
          newCase.setStatus(getStatus(method));
          newCase.setAutomation(getAutomation(method));
          newCase.setSteps(createSteps);
          if (method.isAnnotationPresent(Suite.class)) {
            long suiteId = method.getDeclaredAnnotation(Suite.class).id();
            newCase.suiteId(suiteId);
          }
          Long id = Objects.requireNonNull(QASE_API.createCase(System.getProperty("QASE_PROJECT_CODE"),
              newCase).getResult()).getId();
          log.info(String.format("New test case '%s' was created with @QaseId=%d", title, id));
        }
      } else {
        log.warn("To create new test case in Qase.io please add @QaseTitle annotation");
      }
    } else {
      log.warn("To create new test case in Qase.io please remove @QaseId annotation");
    }
  }
}
