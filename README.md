# Kafka-UI
UI for Apache Kafka management

## Table of contents
- [Getting started](#getting-started)

## Getting started

Build application and docker container

```
./mvnw clean install -Pprod
```

Start application with kafka clusters

```
docker-compose -f ./docker/kafka.yaml
```

Application should be available at http://localhost:8080 .

##Run application without docker:
```
cd kafka-ui-api
./mvnw spring-boot:run -Pprod
```