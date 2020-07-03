![Kafka UI logo](images/kafdrop-logo-2.png) Kafka UI – Free Web UI for Kafka &nbsp; 
------------------
===
![Kafka UI Price Free](images/free-open-source.svg)

<em>Kafka UI is a free open-source web UI for monitoring and management of Apache Kafka clusters. </em> 

Kafka UI is a simple tool that makes your data flows observable, helps find and troubleshoot issues faster and deliver optimal performance. Its lightweight dashboard makes it easy to track key metrics of your Kafka clusters - Brokers, Topics, Partitions, Production, and Consumption. 

Set up Kafka UI with just a couple of easy commands to visualaze your Kafka data in a comprehensible way. You can run the tool locally or in the cloud. 

![Kafka UI interface dashboard screenshot](kafka-ui-interface-dashboard.png)


# Features
* **Manage multiple clusters** — monitor and manage your clusters in one place
* **Monitor performance** —  track key Kafka metrics with a lightweight dashboard
* **View Kafka brokers** — topic and partition assignments, controller status
* **View Kafka topics** — partition count, replication status, and custom configuration
* **View consumer groups** — per-partition parked offsets, combined and per-partition lag
* **Browse messages** — JSON, plain text and Avro encoding
* **Configure topics dynamically** — create new topics with dynamic configuration
* **Configure authentication** — 
 

# Prerequisites

* Java 13 or newer

Optional:

* Docker 

## Installing Prerequisites on Mac
1. Install Homebrew Cask:
```sh
> brew update
> brew cask
``` 
2. Install JAVA 13 with Homebrew Cask:
```sh
> brew tap homebrew/cask-versions
> brew cask install java (or java13 if 13th version is not the latest one)
``` 

# Getting Started
You can run the Kafka Ui locally via Docker or directly from JAR.

## Running Kafka UI Locally with Docker

Building Kafka UI locally with Docker is super easy and takes just a couple of commands to run the UI. The whole workflow step-by-step: 

1. Install Java, Docker and Docker Engine
2. Clone this repository and open a terminal in the directory of the project
3. Build a Docker container with Kafka UI
4. Start Kafka UI with your Kafka clusters
5. Navigate to Kafka UI 

To build a Docker container with Kafka UI (step 3): 
```sh
./mvnw clean install -Pprod
``` 
To start Kafka UI with your Kafka clusters (step 4): 
```sh
./mvnw clean install -Pprod
``` 
To see Kafka UI, navigate to http://localhost:8080 (step 5).

If you want to start only kafka-clusters: 
```sh
docker-compose -f ./docker/kafka-clusters-only.yaml up
``` 
Then start Kafka UI with a **local** profile. 

## Running Kafka UI Locally Without Docker

```sh
.cd kafka-ui-api
./mvnw spring-boot:run -Pprod
``` 


## Running Kafka UI Locally from JAR
To be discussed

## Running Kafka UI in Kubernetes (using a Helm Chart)
To be discussed

## Building

## Docker Compose
To be discussed

# APIs
To be discussed
## JSON endpoints

## Swagger
## CORS Headers
## Topic Configuration
## Actuator

# Guides

To be discussed

## Connecting to a Secure Broker

### Using Docker
#### Environment Variables
##### Basic configuration
##### Advanced configuration

### Using Helm

## Updating the Bootstrap theme

## Securing the Kafdrop UI
### Requirements

### Setup

# Contributing Guidelines
All contributions are more than welcomed. Contributions may close an issue, fix a bug (reported or not reported), add new design blocks, improve the existing code, add new feature, and so on. In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to making participation in our project and our community a harassment-free experience for everyone.

