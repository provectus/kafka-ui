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
- Java (install aarch64 jdk if you have M1/arm chip)
- Maven
  
### How to install
```
git clone https://github.com/provectus/kafka-ui.git
cd  kafka-ui-e2e-checks
docker pull selenoid/vnc:chrome_86.0  
```
### Environment variables

|Name               	                |   Default   | Description
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

1. Run `kafka-ui`: 
```
cd kafka-ui
docker-compose -f documentation/compose/e2e-tests.yaml up -d
```
2. Run tests using your QaseIO API token as environment variable (put instead %s into command below)
```
./mvnw -DQASEIO_API_TOKEN='%s' -pl '!kafka-ui-api' test -Pprod
```

### Reporting

Reports are in `allure-results` folder.
If you have installed allure commandline [here](https://www.npmjs.com/package/allure-commandline))
You can see allure report with command:
```
allure serve
```
### Screenshots

Reference screenshots are in `SCREENSHOTS_FOLDER`  (default,`kafka-ui-e2e-checks/screenshots`)

### How to develop
> ⚠️ todo 
### Setting for different environments
> ⚠️ todo 
### Test Data
> ⚠️ todo 
### Actions
> ⚠️ todo 
### Checks
> ⚠️ todo 
### Parallelization
> ⚠️ todo 
### Tips
 - install `Selenium UI Testing plugin` in IDEA

