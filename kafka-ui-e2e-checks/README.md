### E2E UI automation for Kafka-ui

This repository is for E2E UI automation.

### Table of Contents

- [Prerequisites](#prerequisites)
- [How to install](#how-to-install)
- [How to run checks](#how-to-run-checks)
- [Qase.io integration (for internal users)](#qase-integration)
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
docker pull selenoid/vnc_chrome:103.0 
```

### How to run checks

1. Run `kafka-ui`:

```
cd kafka-ui
docker-compose -f kafka-ui-e2e-checks/docker/selenoid-local.yaml up -d
docker-compose -f documentation/compose/e2e-tests.yaml up -d
```

2. To run test suite select its name (options: regression, sanity, smoke) and put it instead %s into command below

```
./mvnw -Dsurefire.suiteXmlFiles='src/test/resources/%s.xml' -f 'kafka-ui-e2e-checks' test -Pprod
```

3. To run tests on your local Chrome browser just add next VM option to the Run Configuration

```
-Dbrowser=local
```

Expected Location of Chrome
```
Linux:	                    /usr/bin/google-chrome1
Mac:	                    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
Windows XP:                 %HOMEPATH%\Local Settings\Application Data\Google\Chrome\Application\chrome.exe
Windows Vista and newer:    C:\Users%USERNAME%\AppData\Local\Google\Chrome\Application\chrome.exe
```

### Qase integration

Found instruction for Qase.io integration (for internal use only) at `kafka-ui-e2e-checks/QASE.md`

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

