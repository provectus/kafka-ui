# How to configure AWS IAM Authentication

UI for Apache Kafka comes with built-in [aws-msk-iam-auth](https://github.com/aws/aws-msk-iam-auth) library.

You could pass sasl configs in properties section for each cluster.

More details could be found here: [aws-msk-iam-auth](https://github.com/aws/aws-msk-iam-auth)
 
## Examples: 

Please replace 
* <KAFKA_URL> with broker list
* <PROFILE_NAME> with your aws profile


### Running From Docker Image

```sh
docker run -p 8080:8080 \
    -e KAFKA_CLUSTERS_0_NAME=local \
    -e KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=<KAFKA_URL> \
    -e KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL=SASL_SSL \
    -e KAFKA_CLUSTERS_0_PROPERTIES_SASL_MECHANISM=AWS_MSK_IAM \
    -e KAFKA_CLUSTERS_0_PROPERTIES_SASL_CLIENT_CALLBACK_HANDLER_CLASS=software.amazon.msk.auth.iam.IAMClientCallbackHandler \
    -e KAFKA_CLUSTERS_0_PROPERTIES_SASL_JAAS_CONFIG=software.amazon.msk.auth.iam.IAMLoginModule required awsProfileName="<PROFILE_NAME>"; \
    -d provectuslabs/kafka-ui:latest 
```

### Configuring by application.yaml

```yaml
kafka:
  clusters:
    - name: local
      bootstrapServers: <KAFKA_URL>
      properties:
        security.protocol: SASL_SSL
        sasl.mechanism: AWS_MSK_IAM
        sasl.client.callback.handler.class: software.amazon.msk.auth.iam.IAMClientCallbackHandler
        sasl.jaas.config: software.amazon.msk.auth.iam.IAMLoginModule required awsProfileName="<PROFILE_NAME>";
```