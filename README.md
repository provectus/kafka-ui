# Kafka-UI

UI for Apache Kafka management

## Getting started
To work with application, install java13

Build application and docker container

```
./mvnw clean install -Pprod
```

Start application with kafka clusters

```
docker-compose -f ./docker/kafka-ui.yaml
```

Application should be available at http://localhost:8080 .

To start only kafka-clusters:

```
docker-compose -f ./docker/kafka-clusters-only.yaml
```

Kafka-ui then should be started with **local** profile

### Run application without docker:

```
cd kafka-ui-api
./mvnw spring-boot:run -Pprod
```
