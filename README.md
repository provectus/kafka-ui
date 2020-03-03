# Kafka-UI

UI for Apache Kafka management

## Prerequisites

Install Homebrew Cask
```
> brew update
> brew tap caskroom/cask
```

Install JAVA 13 with Homebrew Cask
```
> brew tap caskroom/versions
> brew cask install java13
```


## Getting started

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
