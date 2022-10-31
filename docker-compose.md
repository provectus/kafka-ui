# Quick Start with docker-compose

Environment variables documentation - [see usage](README.md#env_variables).<br/>
We have plenty of example files with more complex configurations. Please check them out in ``docker`` directory.

* Add a new service in docker-compose.yml

```yaml
version: '2'
services:
  kafka-ui:
    image: provectuslabs/kafka-ui
    container_name: kafka-ui
    ports:
      - "8080:8080"
    restart: always
    environment:
      - KAFKA_CLUSTERS_0_NAME=local
      - KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=kafka:9092
```

* If you prefer UI for Apache Kafka in read only mode
   
```yaml
version: '2'
services:
  kafka-ui:
    image: provectuslabs/kafka-ui
    container_name: kafka-ui
    ports:
      - "8080:8080"
    restart: always
    environment:
      - KAFKA_CLUSTERS_0_NAME=local
      - KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=kafka:9092
      - KAFKA_CLUSTERS_0_READONLY=true
```
  
* Start UI for Apache Kafka process

```bash
docker-compose up -d kafka-ui
```
