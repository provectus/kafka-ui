# Kafka-UI
UI for Apache Kafka management

## Table of contents
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Links](#links)

## Requirements
- [docker](https://www.docker.com/get-started) (required to run [Initialize application](#initialize-application))
- [nvm](https://github.com/nvm-sh/nvm) with installed [Node.js](https://nodejs.org/en/) of expected version (check `.nvmrc`)

## Getting started
### Initialize application
Have to be run from root directory
```
./mvnw clean install -Pprod
```
Set correct URL to your API server in `.env`.
```
REACT_APP_API_URL=http://api.your-kafka-rest-api.com:3004
```
If you plan to use full fake REST API you have to update `.env`.
```
REACT_APP_API_URL=http://localhost:3004
```
Start JSON Server if you prefer to use default full fake REST API.
```
npm run mock
```
Start application
```
npm start
```

## Links

* [JSON Server](https://github.com/typicode/json-server) - Fake REST API.
* [Bulma](https://bulma.io/documentation/) - free, open source CSS framework based on Flexbox
* [Create React App](https://github.com/facebook/create-react-app)
