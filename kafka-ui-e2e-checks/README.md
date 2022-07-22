### E2E UI automation for Kafka-ui

This repository is for E2E UI automation. 

### Table of Contents

- [Prerequisites](#prerequisites)
- [How to install](#how-to-install)
- [Environment variables](#environment-variables)
- [How to run checks](#how-to-run-checks)
- [Reporting](#reporting)
- [Environments setup](#environments-setup)
- [Test Data](#test-data)
- [Actions](#actions)
- [Checks](#checks)
- [Parallelization](#parallelization)
- [How to develop](#how-to-develop)

### Prerequisites
- Docker & Docker-compose
- Java 13+
- Maven
  
### How to install
```
git clone https://github.com/provectus/kafka-ui.git
cd  kafka-ui-e2e-checks 
```
### Environment variables

|`Name`               	                |   `Default`   | `Description`
|---------------------------------------|-------------|---------------------
|`USE_LOCAL_BROWSER`                    |  `true`     | clear reports dir on startup
|`CLEAR_REPORTS_DIR`                    |  `true`     | clear reports dir on startup
|`SHOULD_START_SELENOID`                |  `false`    | starts selenoid container on startup
|`SELENOID_URL`                         |  `http://localhost:4444/wd/hub`    | URL of remote selenoid instance
|`BASE_URL`                             |  `http://192.168.1.2:8080/`    | base url for selenide configuration
|`PIXELS_THRESHOLD`                     |  `200`    | Amount of pixels, that should be different to fail screenshot check
|`SCREENSHOTS_FOLDER`                   |  `screenshots/`    | folder for keeping reference screenshots
|`DIFF_SCREENSHOTS_FOLDER`              |  `build/__diff__/`    | folder for keeping  screenshots diffs
|`ACTUAL_SCREENSHOTS_FOLDER`            |  `build/__actual__/`   | folder for keeping  actual screenshots(during checks)
|`SHOULD_SAVE_SCREENSHOTS_IF_NOT_EXIST` |  `true`    | folder for keeping  actual screenshots(during checks)
|`TURN_OFF_SCREENSHOTS`                 |  `false`    | If true, `compareScreenshots` will not fail on different screenshots. Useful for functional debugging on local machine, while preserving golden screenshots made in selenoid

### How to run checks

1. Install kafka-ui
```
cd <projectRoot>/kafka-ui
mvn clean install -Dmaven.test.skip
```

2. Run `kafka-ui` (from command line or start services from the file kafka-ui-connectors.yaml in IDEA)
```
cd docker
docker-compose -f kafka-ui-connectors.yaml up -d
```

3. Compile `kafka-ui-contract` project
```
cd <projectRoot>/kafka-ui-contract
mvn clean compile
```
4. Run checks 
```
cd kafka-ui-e2e-checks
mvn test
```
Tests will be running in docker in parallel. So, write independent tests.

You just need update a version of selenoid/vnc_chrome:[version]. Use the las stable version, do NOT use [latest]- selenoid/vnc_chrome:latest

If you updated a version of chrome also need to update a version in the browsers.json file kafka-ui-e2e-checks/selenoid/config/browsers.json


### Reporting

Reports are in `allure-results` folder.
If you have installed allure commandline(e.g. like [here](https://docs.qameta.io/allure/#_installing_a_commandline) or [here](https://www.npmjs.com/package/allure-commandline))
You can see allure report with command:
```
allure serve
```
### Screenshots

Reference screenshots are in `SCREENSHOTS_FOLDER`  (default,`kafka-ui-e2e-checks/screenshots`)

### How to develop
1. Write independent tests, because all tests run in parallel
2. Use API for creating some prerequisite

### Qase.io integration
#### - Creating new test with annotation (manual/to_be_automated/automated)

Set annotation @Suite (test will be created in correct suite in Qase.io)

Set annotation @AutomationStatus for new test: @AutomationStatus(status = Status.MANUAL or Status.TO_BE_AUTOMATED or Status.AUTOMATED)

Run a test 'mvn test' and new test will be created in Qase.io. Get test case id and set annotation @CaseId([id])

#### - Automate test that already exist in Qase.io
If test already exist in Qase.io set all annotations (@Suite, @AutomationStatus, @CaseId)

Change title in Qase.io <className\>.<methodName\>: <Method name\> if no change a title new test will be created.


### Setting for different environments
> ⚠️ todo 
### Test Data
> ⚠️ todo 
### Actions
> ⚠️ todo 
### Checks
> ⚠️ todo 
### Parallelization
1. Tests have already run in parallel. 

To change strategy or disable/enable Parallelization change a file src/test/resources/junit-platform.properties.

2. You can set run Classes in parallel instead of tests
```
junit.jupiter.execution.parallel.mode.default = same_thread
junit.jupiter.execution.parallel.mode.classes.default = concurrent
```

### Tips
 - install `Selenium UI Testing plugin` in IDEA

