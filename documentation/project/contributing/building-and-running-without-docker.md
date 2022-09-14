# Build & Run Without Docker

Once you installed the prerequisites and cloned the repository, run the following steps in your project directory:

## <a name="run_without_docker_quickly"></a> Running Without Docker Quickly

- [Download the latest kafka-ui jar file](https://github.com/provectus/kafka-ui/releases)
#### <a name="run_kafkaui_jar_file"></a> Execute the jar
```sh
java -Dspring.config.additional-location=<path-to-application-local.yml> -jar <path-to-kafka-ui-jar>
```
- Example of how to configure clusters in the [application-local.yml](https://github.com/provectus/kafka-ui/blob/master/kafka-ui-api/src/main/resources/application-local.yml) configuration file.

## <a name="build_and_run_without_docker"></a> Building And Running Without Docker

> **_NOTE:_**  If you want to get kafka-ui up and running locally quickly without building the jar file manually, then just follow [Running Without Docker Quickly](#run_without_docker_quickly)

> Comment out `com.spotify` plugin in `kafka-ui-api` pom.xml

- [Command to build the jar](./building.md#cmd_to_build_kafkaui_without_docker)

> Once your build is successful and the jar file named kafka-ui-api-0.0.1-SNAPSHOT.jar is generated inside `kafka-ui-api/target`.

- [Execute the jar](#run_kafkaui_jar_file)
