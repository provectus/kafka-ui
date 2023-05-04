# Configuration

Most of the Helm charts parameters are common, follow table describes unique parameters related to application configuration.

#### Kafka-UI parameters

| Parameter                                 | Description                                                                                                                                    | Default     |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `existingConfigMap`                       | Name of the existing ConfigMap with Kafka-UI environment variables                                                                             | `nil`       |
| `existingSecret`                          | Name of the existing Secret with Kafka-UI environment variables                                                                                | `nil`       |
| `envs.secret`                             | Set of the sensitive environment variables to pass to Kafka-UI                                                                                 | `{}`        |
| `envs.config`                             | Set of the environment variables to pass to Kafka-UI                                                                                           | `{}`        |
| `yamlApplicationConfigConfigMap`          | Map with name and keyName keys, name refers to the existing ConfigMap, keyName refers to the ConfigMap key with Kafka-UI config in Yaml format | `{}`        |
| `yamlApplicationConfig`                   | Kafka-UI config in Yaml format                                                                                                                 | `{}`        |
| `networkPolicy.enabled`                   | Enable network policies                                                                                                                        | `false`     |
| `networkPolicy.egressRules.customRules`   | Custom network egress policy rules                                                                                                             | `[]`        |
| `networkPolicy.ingressRules.customRules`  | Custom network ingress policy rules                                                                                                            | `[]`        |
| `podLabels`                               | Extra labels for Kafka-UI pod                                                                                                                  | `{}`        |
| `route.enabled`                           | Enable OpenShift route to expose the Kafka-UI service                                                                                          | `false`     |
| `route.annotations`                       | Add annotations to the OpenShift route                                                                                                         | `{}`        |
| `route.tls.enabled`                       | Enable OpenShift route as a secured endpoint                                                                                                   | `false`     |
| `route.tls.termination`                   | Set OpenShift Route TLS termination                                                                                                            | `edge`      |
| `route.tls.insecureEdgeTerminationPolicy` | Set OpenShift Route Insecure Edge Termination Policy                                                                                           | `Redirect`  |

### Example

To install Kafka-UI need to execute follow:

```bash
helm repo add kafka-ui https://provectus.github.io/kafka-ui
helm install kafka-ui kafka-ui/kafka-ui --set envs.config.KAFKA_CLUSTERS_0_NAME=local --set envs.config.KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=kafka:9092
```

To connect to Kafka-UI web application need to execute:

```bash
kubectl port-forward svc/kafka-ui 8080:80
```

Open the `http://127.0.0.1:8080` on the browser to access Kafka-UI.
