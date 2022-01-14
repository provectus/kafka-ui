# How to configure SASL SCRAM Authentication

You could pass sasl configs in properties section for each cluster.
 
## Examples: 

Please replace 
- <KAFKA_NAME> with cluster name
- <KAFKA_URL> with broker list
- <KAFKA_USERNAME> with username
- <KAFKA_PASSWORD> with password

### Running From Docker Image

```sh
docker run -p 8080:8080 \
    -e KAFKA_CLUSTERS_0_NAME=<KAFKA_NAME> \
    -e KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=<KAFKA_URL> \
    -e KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL=SASL_SSL \
    -e KAFKA_CLUSTERS_0_PROPERTIES_SASL_MECHANISM=SCRAM-SHA-512 \     
    -e KAFKA_CLUSTERS_0_PROPERTIES_SASL_JAAS_CONFIG=org.apache.kafka.common.security.scram.ScramLoginModule required username="<KAFKA_USERNAME>" password="<KAFKA_PASSWORD>"; \
    -d provectuslabs/kafka-ui:latest 
```

### Running From Docker-compose file

```yaml

version: '3.4'
services:
  
  kafka-ui:
    image: provectuslabs/kafka-ui
    container_name: kafka-ui
    ports:
      - "888:8080"
    restart: always
    environment:
      - KAFKA_CLUSTERS_0_NAME=<KAFKA_NAME>
      - KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=<KAFKA_URL>
      - KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL=SASL_SSL
      - KAFKA_CLUSTERS_0_PROPERTIES_SASL_MECHANISM=SCRAM-SHA-512
      - KAFKA_CLUSTERS_0_PROPERTIES_SASL_JAAS_CONFIG=org.apache.kafka.common.security.scram.ScramLoginModule required username="<KAFKA_USERNAME>" password="<KAFKA_PASSWORD>";
      - KAFKA_CLUSTERS_0_PROPERTIES_PROTOCOL=SASL
```

### Configuring by application.yaml

```yaml
kafka:
  clusters:
    - name: local
      bootstrapServers: <KAFKA_URL>
      properties:
        security.protocol: SASL_SSL
        sasl.mechanism: SCRAM-SHA-512        
        sasl.jaas.config: org.apache.kafka.common.security.scram.ScramLoginModule required username="<KAFKA_USERNAME>" password="<KAFKA_PASSWORD>";
```
