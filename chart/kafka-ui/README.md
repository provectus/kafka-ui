# Kafka-UI Helm Chart
## Configuration
Most of the Helm charts parameters are common, follow table describe unique parameters related to application configuration.
### Kafka-UI parameters
| Parameter| Description| Default|
|---|---|---|
| `existingConfigMap`| Name of the existing ConfigMap with Kafka-UI environment variables | `nil`|
| `existingSecret`| Name of the existing Secret with Kafka-UI environment variables| `nil`|
| `envs.secret`| Set of the sensitive environment variables to pass to Kafka-UI | `{}`|
| `envs.config`| Set of the environment variables to pass to Kafka-UI | `{}`|

## Example
To install Kafka-UI need to execute follow:
``` bash 
helm install kafka-ui . --set envs.config.KAFKA_CLUSTERS_0_NAME=local --set envs.config.KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=kafka:9092
``` 
To connect to Kafka-UI web application need to execute:
``` bash
kubectl port-forward svc/kafka-ui 8080:80
```
Open the `http://127.0.0.1:8080` on the browser to access Kafka-UI.