---
description: Build & Run Without Docker
---

# Without Docker

Once you installed the prerequisites and cloned the repository, run the following steps in your project directory:

### Running Without Docker Quickly <a href="#run_without_docker_quickly" id="run_without_docker_quickly"></a>

* [Download the latest kafka-ui jar file](https://github.com/provectus/kafka-ui/releases)

**Execute the jar**

```
java -Dspring.config.additional-location=<path-to-application-local.yml> --add-opens java.rmi/javax.rmi.ssl=ALL-UNNAMED -jar <path-to-kafka-ui-jar>
```

* Example of how to configure clusters in the [application-local.yml](https://github.com/provectus/kafka-ui/blob/master/kafka-ui-api/src/main/resources/application-local.yml) configuration file.

### Building And Running Without Docker <a href="#build_and_run_without_docker" id="build_and_run_without_docker"></a>

> _**NOTE:**_ If you want to get kafka-ui up and running locally quickly without building the jar file manually, then just follow Running Without Docker Quickly

> Comment out `docker-maven-plugin` plugin in `kafka-ui-api` pom.xml

* Command to build the jar

> Once your build is successful and the jar file named kafka-ui-api-0.0.1-SNAPSHOT.jar is generated inside `kafka-ui-api/target`.

* Execute the jar
