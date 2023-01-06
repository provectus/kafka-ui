# Getting started

We have plenty of [docker-compose files](https://github.com/provectus/kafka-ui/blob/master/documentation/compose/DOCKER\_COMPOSE.md) as examples. They're built for various configuration stacks.

## Guides

* [SSO configuration](https://github.com/provectus/kafka-ui/blob/master/documentation/guides/SSO.md)
* [AWS IAM configuration](https://github.com/provectus/kafka-ui/blob/master/documentation/guides/AWS\_IAM.md)
* [Docker-compose files](https://github.com/provectus/kafka-ui/blob/master/documentation/compose/DOCKER\_COMPOSE.md)
* [Connection to a secure broker](https://github.com/provectus/kafka-ui/blob/master/documentation/guides/SECURE\_BROKER.md)
* [Configure seriliazation/deserialization plugins or code your own](https://github.com/provectus/kafka-ui/blob/master/documentation/guides/Serialization.md)

#### Configuration File

Example of how to configure clusters in the [application-local.yml](https://github.com/provectus/kafka-ui/blob/master/kafka-ui-api/src/main/resources/application-local.yml) configuration file:

```
kafka:
  clusters:
    -
      name: local
      bootstrapServers: localhost:29091
      schemaRegistry: http://localhost:8085
      schemaRegistryAuth:
        username: username
        password: password
#     schemaNameTemplate: "%s-value"
      metrics:
        port: 9997
        type: JMX
    -
```

* `name`: cluster name
* `bootstrapServers`: where to connect
* `schemaRegistry`: schemaRegistry's address
* `schemaRegistryAuth.username`: schemaRegistry's basic authentication username
* `schemaRegistryAuth.password`: schemaRegistry's basic authentication password
* `schemaNameTemplate`: how keys are saved to schemaRegistry
* `metrics.port`: open JMX port of a broker
* `metrics.type`: Type of metrics, either JMX or PROMETHEUS. Defaulted to JMX.
* `readOnly`: enable read only mode

Configure as many clusters as you need by adding their configs below separated with `-`.

### Running a Docker Image

The official Docker image for UI for Apache Kafka is hosted here: [hub.docker.com/r/provectuslabs/kafka-ui](https://hub.docker.com/r/provectuslabs/kafka-ui).

Launch Docker container in the background:

```
docker run -p 8080:8080 \
	-e KAFKA_CLUSTERS_0_NAME=local \
	-e KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=kafka:9092 \
	-d provectuslabs/kafka-ui:latest
```

Then access the web UI at [http://localhost:8080](http://localhost:8080/). Further configuration with environment variables - [see environment variables](https://github.com/provectus/kafka-ui#env\_variables)

#### Docker Compose

If you prefer to use `docker-compose` please refer to the [documentation](https://github.com/provectus/kafka-ui/blob/master/docker-compose.md).

#### Helm chart

Helm chart could be found under [charts/kafka-ui](https://github.com/provectus/kafka-ui/tree/master/charts/kafka-ui) directory

Quick-start instruction [here](https://github.com/provectus/kafka-ui/blob/master/helm\_chart.md)

### Building With Docker

#### Prerequisites

Check [prerequisites.md](https://github.com/provectus/kafka-ui/blob/master/documentation/project/contributing/prerequisites.md)

#### Building and Running

Check [building.md](https://github.com/provectus/kafka-ui/blob/master/documentation/project/contributing/building.md)

### Building Without Docker

#### Prerequisites

[Prerequisites](https://github.com/provectus/kafka-ui/blob/master/documentation/project/contributing/prerequisites.md) will mostly remain the same with the exception of docker.

#### Running without Building

[How to run quickly without building](https://github.com/provectus/kafka-ui/blob/master/documentation/project/contributing/building-and-running-without-docker.md#run\_without\_docker\_quickly)

#### Building and Running

[How to build and run](https://github.com/provectus/kafka-ui/blob/master/documentation/project/contributing/building-and-running-without-docker.md#build\_and\_run\_without\_docker)
