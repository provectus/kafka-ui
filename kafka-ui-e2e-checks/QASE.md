### E2E integration with Qase.io TMS (for internal users)

### Table of Contents

- [Intro](#intro)
- [Set up Qase.io integration](#set-up-qase-integration)
- [Test case creation](#test-case-creation)
- [Test run reporting](#test-run-reporting)

### Intro

We're using [Qase.io](https://help.qase.io/en/) as TMS to keep test cases and accumulate test runs.
Integration is set up through API using [qase-api](https://mvnrepository.com/artifact/io.qase/qase-api)
and [qase-testng](https://mvnrepository.com/artifact/io.qase/qase-testng) libraries.

### Set up Qase integration

To set up integration locally add next VM option `-DQASEIO_API_TOKEN='%s'`
(add your [Qase token](https://app.qase.io/user/api/token) instead of '%s') into your run configuration

### Test case creation

All new test cases can be added into TMS by default if they have no QaseId and QaseTitle matching already existing
cases.
But to handle `@Suite` and `@Automation` we added custom QaseCreateListener. To create new test case for next sync with
Qase (see example `kafka-ui-e2e-checks/src/test/java/com/provectus/kafka/ui/qaseSuite/Template.java`):

1. Create new class in `kafka-ui-e2e-checks/src/test/java/com/provectus/kafka/ui/qaseSuite/suit`
2. Inherit it from `kafka-ui-e2e-checks/src/test/java/com/provectus/kafka/ui/qaseSuite/BaseQaseTest.java`
3. Create new test method with some name inside the class and annotate it with:

- `@Automation` (optional - Not automated by default) - to set one of automation states: NOT_AUTOMATED, TO_BE_AUTOMATED,
  AUTOMATED
- `@QaseTitle` (required) - to set title for new test case and to check is there no existing cases with same title in
  Qase.io
- `@Status` (optional - Draft by default) - to set one of case statuses: ACTUAL, DRAFT, DEPRECATED
- `@Suite` (optional) - to store new case in some existing package need to set its id, otherwise case will be stored in
  the root
- `@Test` (required) - annotation from TestNG to specify this method as test

4. Create new private void step methods with some name inside the same class and annotate it with
   @io.qase.api.annotation.Step to specify this method as step.
5. Use defined step methods inside created test method in concrete order
6. If there are any additional cases to create you can repeat scenario in a new class
7. There are two ways to sync newly created cases in the framework with Qase.io:

- sync can be performed locally - run new test classes with
  already [set up Qase.io integration](#Set up Qase.io integration)
- also you can commit and push your changes, then
  run [E2E Manual suite](https://github.com/provectus/kafka-ui/actions/workflows/e2e-manual.yml) on your branch

8. No test run in Qase.io will be created, new test case will be stored defined directory
   in [project's repository](https://app.qase.io/project/KAFKAUI)
9. To add expected results into created test case edit in Qase.io manually

### Test run reporting

To handle manual test cases with status `Skipped` we added custom QaseResultListener. To create new test run:

1. All test methods should be annotated with actual `@QaseId`
2. There are two ways to sync newly created cases in the framework with Qase.io:

- run can be performed locally - run test classes (or suites) with
  already [set up Qase.io integration](#Set up Qase.io integration), they will be labeled as `Automation CUSTOM suite`
- also you can commit and push your changes, then
  run [E2E Automation suite](https://github.com/provectus/kafka-ui/actions/workflows/e2e-automation.yml) on your branch

3. All new test runs will be added into [project's test runs](https://app.qase.io/run/KAFKAUI) with corresponding label
   using QaseId to identify existing cases
4. All test cases from manual suite are set up to have `Skipped` status in test runs to perform them manually
