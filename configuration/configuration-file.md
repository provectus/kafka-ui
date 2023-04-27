---
description: This page explains configuration file structure
---

# Configuration file

Let's start with that there are two possible ways to configure the app, they can interchange each other or even supplement each other.

There are two ways: YAML config & env. variables config. We **strongly** recommend using YAML in favor of env variables for the most part of the config. You can use env vars to override the default config on some different environments.

[This tool](https://env.simplestep.ca/) can help you to translate your config back and forth from YAML to env vars.

We will mostly provide examples of configs in YAML format, but sometimes single properties might be written in form of env variables.

Rather than writing your config from a scratch, it would be more convenient to use one of the ready-to-go [compose examples](compose-examples.md) and adjust it to your needs.

#### Providing a config path for the app instance:

**Docker**: `docker run -it -p 8080:8080 -e spring.config.additional-location=/tmp/config.yml -v /tmp/kui/config.yml:/tmp/config.yml provectuslabs/kafka-ui`

**Docker compose**:&#x20;

```
services:
  kafka-ui:
    container_name: kafka-ui
    image: provectuslabs/kafka-ui:latest
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      # other properties, omitted
      SPRING_CONFIG_ADDITIONAL-LOCATION: /config.yml
    volumes:
      - /tmp/config.yml:/config.yml
```

**Jar**: `java -Dspring.config.additional-location=<path-to-application-local.yml> -jar <path-to-jar>.jar`

#### Basic config structure

```yaml
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
```

* `name`: cluster name
* `bootstrapServers`: where to connect
* `schemaRegistry`: schemaRegistry's address
* `schemaRegistryAuth.username`: schemaRegistry's basic authentication username
* `schemaRegistryAuth.password`: schemaRegistry's basic authentication password
* `schemaNameTemplate`: how keys are saved to Schema Registry
* `metrics.port`: open the JMX port of a broker
* `metrics.type`: Type of metrics, either JMX or PROMETHEUS. Defaulted to JMX.
* `readOnly`: enable read-only mode

Configure as many clusters as you need by adding their configs below separated with `-`.
