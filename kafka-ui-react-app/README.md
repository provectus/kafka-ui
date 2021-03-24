# Kafka-UI
UI for Apache Kafka management

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=provectus_kafka-ui_frontend&metric=alert_status)](https://sonarcloud.io/dashboard?id=provectus_kafka-ui_frontend)

## Table of contents
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Links](#links)

## Requirements
- [docker](https://www.docker.com/get-started) (required to run [Initialize application](#initialize-application))
- [nvm](https://github.com/nvm-sh/nvm) with installed [Node.js](https://nodejs.org/en/) of expected version (check `.nvmrc`)

## Getting started

Have to be run from root directory.

Start Kafka UI with your Kafka clusters:
```sh
docker-compose -f ./docker/kafka-ui.yaml up
```

Go to react app folder
```sh
cd ./kafka-ui-react-app
```

Generate API clients from OpenAPI document
```sh
npm run gen:sources
```

Start application
```sh
npm start
```
## Links

* [Bulma](https://bulma.io/documentation/) - free, open source CSS framework based on Flexbox
* [Create React App](https://github.com/facebook/create-react-app)
