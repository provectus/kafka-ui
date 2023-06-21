---
description: Quick Start with Helm Chart
---

# Quick start

## General

1. Clone/Copy Chart to your working directory
2.  Execute command

    ```
    helm repo add kafka-ui https://provectus.github.io/kafka-ui-charts
    helm install kafka-ui kafka-ui/kafka-ui
    ```

#### Passing Kafka-UI configuration as Dict

Create values.yml file

```
yamlApplicationConfig:
  kafka:
    clusters:
      - name: yaml
        bootstrapServers:  kafka-cluster-broker-endpoints:9092
  auth:
    type: disabled
  management:
    health:
      ldap:
        enabled: false
```

Install by executing command

> helm install helm-release-name charts/kafka-ui -f values.yml

#### Passing configuration file as ConfigMap

Create config map

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: kafka-ui-configmap
data:
  config.yml: |-
    kafka:
      clusters:
        - name: yaml
          bootstrapServers: kafka-cluster-broker-endpoints:9092
    auth:
      type: disabled
    management:
      health:
        ldap:
          enabled: false
```

This ConfigMap will be mounted to the Pod

Install by executing the command

> helm install helm-release-name charts/kafka-ui --set yamlApplicationConfigConfigMap.name="kafka-ui-configmap",yamlApplicationConfigConfigMap.keyName="config.yml"

#### Passing environment variables as ConfigMap

Create config map

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: kafka-ui-helm-values
data:
  KAFKA_CLUSTERS_0_NAME: "kafka-cluster-name"
  KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: "kafka-cluster-broker-endpoints:9092"
  AUTH_TYPE: "DISABLED"
  MANAGEMENT_HEALTH_LDAP_ENABLED: "FALSE" 
```

Install by executing the command

> helm install helm-release-name charts/kafka-ui --set existingConfigMap="kafka-ui-helm-values"
