# Kafka-UI
UI for Apache Kafka management

## Table of contents
- [Getting started](#getting-started)

## Getting started

Build docker container

```
./mvnw clean install -Pprod
```

Run docker-compose

```
docker-compose -f ./docker/kafka.yaml
```

Access application via http://localhost:8080
