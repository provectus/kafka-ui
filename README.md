# Kafka-UI

UI for Apache Kafka management

## Prerequisites

Install Homebrew Cask
```
> brew update
> brew cask
```

Install JAVA 13 with Homebrew Cask
```
> brew tap homebrew/cask-versions
> brew cask install java (or java13 if 13th version is not the latest one)
```


## Getting started

Build application and docker container

```
./mvnw clean install -Pprod
```

Start application with kafka clusters

```
docker-compose -f ./docker/kafka-ui.yaml up
```

Application should be available at http://localhost:8080.

To start only kafka-clusters:

```
docker-compose -f ./docker/kafka-clusters-only.yaml up
```

Kafka-ui then should be started with **local** profile

### Run application without docker:

```
cd kafka-ui-api
./mvnw spring-boot:run -Pprod
```
