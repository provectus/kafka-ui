# UI for Apache Kafka
UI for Apache Kafka management

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=com.provectus%3Akafka-ui_frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=com.provectus%3Akafka-ui_frontend)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=com.provectus%3Akafka-ui_frontend&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=com.provectus%3Akafka-ui_frontend)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=com.provectus%3Akafka-ui_frontend&metric=coverage)](https://sonarcloud.io/summary/new_code?id=com.provectus%3Akafka-ui_frontend)

## Table of contents
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Links](#links)

## Requirements
- [docker](https://www.docker.com/get-started) (required to run [Initialize application](#initialize-application))
- [nvm](https://github.com/nvm-sh/nvm) with installed [Node.js](https://nodejs.org/en/) of expected version (check `.nvmrc`)

## Getting started

Go to react app folder
```sh
cd ./kafka-ui-react-app
```

Install [pnpm](https://pnpm.io/installation)
```
npm install -g pnpm
```

Install dependencies
```
pnpm install
```

Generate API clients from OpenAPI document
```sh
pnpm gen:sources
```

## Start application
### Proxying API Requests in Development

Create or update existing `.env.local` file with
```
VITE_DEV_PROXY= https://api.server # your API server
```

Run the application
```sh
pnpm start
```

### Docker way

Have to be run from root directory.

Start UI for Apache Kafka with your Kafka clusters:
```sh
docker-compose -f ./documentation/compose/kafka-ui.yaml up
```

Make sure that none of the `.env*` files contain `DEV_PROXY` variable

Run the application
```sh
pnpm start
```
## Links

* [Vite](https://github.com/vitejs/vite)
