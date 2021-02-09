# Quick Start with docker-compose

* Add a new service in docker-compose.yml

```yaml
version: '2'
services:
  kafka-ui:
    image: provectuslabs/kafka-ui
    container_name: kafka-ui
    ports:
      - "9000:8080"
    restart: always
    environment:
      -e KAFKA_CLUSTERS_0_NAME=local
      -e KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=kafka:9092
      -e KAFKA_CLUSTERS_0_ZOOKEEPER=localhost:2181
```
   
  
* Start Kafka UI process

```bash
docker-compose up -d kafka-ui
```
