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
- Java
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

1. Run `kafka-ui` 
```
cd docker
docker-compose -f kafka-ui.yaml up -d
```
2. Run `selenoid-ui` 
```
cd kafka-ui-e2e-checks/docker
docker-compose -f selenoid.yaml up -d
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

* There are several ways to run checks

1. If you don't have  selenoid run on your machine
```
 mvn test -DSHOULD_START_SELENOID=true
```
⚠️ If you want to run checks in IDE with this approach, you'd need to set up
environment variable(`SHOULD_START_SELENOID=true`) in `Run/Edit Configurations..`

2. For development purposes it is better to just start separate selenoid in docker-compose
Do it in separate window
```
cd docker
docker-compose -f selenoid.yaml up
```
Then you can just `mvn test`. By default, `SELENOID_URL` will resolve to `http://localhost:4444/wd/hub`

It's preferred way to run. 

* If you have remote selenoid instance, set 

`SELENOID_URL` environment variable

Example:
`mvn test -DSELENOID_URL=http://localhost:4444/wd/hub`
That's the way to run tests in CI with selenoid set up somewhere in cloud

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

