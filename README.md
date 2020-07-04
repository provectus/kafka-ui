![Kafka UI logo](images/kafka-ui-logo.png) Kafka UI – Free Web UI for Kafka &nbsp; 
------------------

![Kafka UI Price Free](images/free-open-source.svg)

<em>Kafka UI is a free open-source web UI for monitoring and management of Apache Kafka clusters. </em> 

Kafka UI is a simple tool that makes your data flows observable, helps find and troubleshoot issues faster and deliver optimal performance. Its lightweight dashboard makes it easy to track key metrics of your Kafka clusters - Brokers, Topics, Partitions, Production, and Consumption. 

Set up Kafka UI with just a couple of easy commands to visualize your Kafka data in a comprehensible way. You can run the tool locally or in the cloud. 

![Kafka UI interface dashboard screenshot](images/kafka-ui-interface-dashboard.png)


# Features
* **Multi-Cluster Management** — monitor and manage all your clusters in one place
* **Performance Monitoring with Metrics Dashboard** —  track key Kafka metrics with a lightweight dashboard
* **View Kafka brokers** — view topic and partition assignments, controller status
* **View Kafka topics** — view partition count, replication status, and custom configuration
* **View consumer groups** — view per-partition parked offsets, combined and per-partition lag
* **Browse messages** — browse messages with JSON, plain text and Avro encoding
* **Dynamic Topic Configuration** — create and configure new topics with dynamic configuration
* **Configurable authentification** — secure your installation with optional Github/Gitlub/Google OAuth 2.0
 
# Building

## Prerequisites

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
You can build Kafka UI locally or run using Docker image. 

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
## Running Kafka UI From Docker Image
The official Docker image for Kafka UI is hosted here: [hub.docker.com/r/provectus/kafka-ui](https://hub.docker.com/r/provectus/kafka-ui).

Launch Docker container in the background:
```sh
docker run -d {}/kafka-ui-api:latest 
	-e KAFKA_CLUSTERS_0_NAME=local 
	-e KAFKA_CLUSTERS_0__BOOTSTRAPSERVERS=kafka0:29092

```
Then access the web UI at [http://localhost:9000](http://localhost:9000).


## Running in Kubernetes (using a Helm Chart)
To be done

# Guides

To be done

## Connecting to a Secure Broker

Kafka UI supports TLS (SSL) and SASL connections for [encryption and authentication](http://kafka.apache.org/090/documentation.html#security). This can be configured by providing a combination of the following files (placed into the Kafka root directory):

* `kafka.truststore.jks`: specifying the certificate for authenticating brokers, if TLS is enabled.
* `kafka.keystore.jks`: specifying the private key to authenticate the client to the broker, if mutual TLS authentication is required.
* `kafka.properties`: specifying the necessary configuration, including key/truststore passwords, cipher suites, enabled TLS protocol versions, username/password pairs, etc. When supplying the truststore and/or keystore files, the `ssl.truststore.location` and `ssl.keystore.location` properties will be assigned automatically.


### Using Docker

#### Environment Variables
##### Basic configuration
##### Advanced configuration



