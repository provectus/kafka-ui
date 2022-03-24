## Connecting to a Secure Broker

The app supports TLS (SSL) and SASL connections for [encryption and authentication](http://kafka.apache.org/090/documentation.html#security). <br/>

### Running From Docker Image

```sh
docker run -p 8080:8080 \
    -e KAFKA_CLUSTERS_0_NAME=<KAFKA_NAME> \
    -e KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=<SSL LISTENER> \
    -e KAFKA_CLUSTERS_0_ZOOKEEPER: <ZOOKEEPER> \
    -e KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL=SSL \
    -e KAFKA_CLUSTERS_0_PROPERTIES_SSL_TRUSTSTORE_LOCATION=/kafka.truststore.jks \
    -e KAFKA_CLUSTERS_0_PROPERTIES_SSL_TRUSTSTORE_PASSWORD: <KAFKA_PASSWORD>; \
    -v ./ssl/kafka.truststore.jks:/kafka.truststore.jks \
    -d provectuslabs/kafka-ui:latest
```

### Running From Docker-compose file

```yaml
kafka-ui:
  container_name: kafka-ui
  image: provectuslabs/kafka-ui:latest
  ports:
    - 8080:8080
  environment:
    KAFKA_CLUSTERS_0_NAME: <KAFKA_NAME>
    KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: <SSL LISTENER> # e.g., kafka0:29092
    KAFKA_CLUSTERS_0_ZOOKEEPER: <ZOOKEEPER> # e.g., zookeeper0:2181
    KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL: SSL
    KAFKA_CLUSTERS_0_PROPERTIES_SSL_TRUSTSTORE_LOCATION: /kafka.truststore.jks
    KAFKA_CLUSTERS_0_PROPERTIES_SSL_TRUSTSTORE_PASSWORD: <KAFKA_PASSWORD> # e.g., 12345678
  volumes:
    - ./ssl/kafka.truststore.jks:/kafka.truststore.jks
```
