# Build & Run Without Docker

Once you installed the prerequisites and cloned the repository, run the following steps in your project directory:

## <a name="run_without_docker_quickly"></a> Running Without Docker Quickly
- [Download the latest kafka-ui jar file](https://github.com/provectus/kafka-ui/releases)
- Then run the following command.
```sh
java -Dspring.config.additional-location=<path-to-application-local.yml> -jar <path-to-kafka-ui-jar>
```
- Example of how to configure clusters in the [application-local.yml](https://github.com/provectus/kafka-ui/blob/master/kafka-ui-api/src/main/resources/application-local.yml) configuration file.

## <a name="build_and_run_without_docker"></a> Building And Running Without Docker
> **_NOTE:_**  If you want to get kafka-ui up and running locally quickly, then just follow [Running Without Docker](#run_without_docker_quickly)

> Skip the maven tests as they might not be successful

> Comment out `com.spotify` plugin in `kafka-ui-api` pom.xml

- if you need to build the frontend `kafka-ui-react-app`, go here
     - [kafka-ui-react-app-build-documentation](../../../kafka-ui-react-app/README.md)

- In case you want to build `kafka-ui-api` by skipping the tests
```sh
./mvnw clean install -Dmaven.test.skip=true -Pprod
```

- To build only the `kafka-ui-api` you can use this command:
```sh
./mvnw -f kafka-ui-api/pom.xml clean install -Pprod -DskipUIBuild=true
```

> Once your build is successful and the jar files are generated.
- Then run the following command.
```sh
java -Dspring.config.additional-location=<path to application-local.yml> -jar <path to kafka-ui jar file>
```
- Example of how to configure clusters in the [application-local.yml](https://github.com/provectus/kafka-ui/blob/master/kafka-ui-api/src/main/resources/application-local.yml) configuration file.
