### E2E UI automation for Kafka-ui

This repository is for E2E UI automation.

### Table of Contents

- [Prerequisites](#prerequisites)
- [How to install](#how-to-install)
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

### How to run checks

1. Run `kafka-ui`:

```
cd kafka-ui
docker-compose -f documentation/compose/e2e-tests.yaml up -d
```

2. Run Smoke test suite using your QaseIO API token as environment variable (put instead %s into command below)

```
./mvnw -DQASEIO_API_TOKEN='%s' -Dsurefire.suiteXmlFiles='src/test/resources/smoke.xml' -Dsuite=smoke -f 'kafka-ui-e2e-checks' test -Pprod
```

3. Run Sanity test suite using your QaseIO API token as environment variable (put instead %s into command below)

```
./mvnw -DQASEIO_API_TOKEN='%s' -Dsurefire.suiteXmlFiles='src/test/resources/sanity.xml' -Dsuite=sanity -f 'kafka-ui-e2e-checks' test -Pprod
```

4. Run Regression test suite using your QaseIO API token as environment variable (put instead %s into command below)

```
./mvnw -DQASEIO_API_TOKEN='%s' -Dsurefire.suiteXmlFiles='src/test/resources/regression.xml' -Dsuite=regression -f 'kafka-ui-e2e-checks' test -Pprod
```

5. To run tests on your local Chrome browser just add next VM option to the Run Configuration

```
-Dbrowser=local
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

