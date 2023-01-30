# Implement ssl for kafka-ui
To implemet ssl for kafka-ui you need to provide jks files to pod. Here is the instruction how to that.
## Create config map with conntent from kafka.truststore.jks and kafka.keystore.jks.
Create configmap.yaml file with following content.
```
apiVersion: v1
kind: ConfigMap
metadata:
  name: ssl-files
  # Specify namespace if needed, uncomment next line and provide namespace
  #namespace:  {namespace}
data:
  kafka.truststore.jks: |
    ## content of kafka.truststore.jks
  kafka.keystore.jks: |
    ## content of kafka.keystore.jks
 ```
## Create secret.
Encode secret with base64(You can use this tool https://www.base64encode.org/). Create secret.yaml file with following content
 ```
apiVersion: v1
kind: Secret
metadata:
  name: ssl-secret
  # Specify namespace if needed, uncomment next line and provide namespace
  #namespace: {namespace}
type: Opaque
data:
  KAFKA_CLUSTERS_0_PROPERTIES_SSL_TRUSTSTORE_PASSWORD: ##Base 64 encoded secret
  KAFKA_CLUSTERS_0_PROPERTIES_SSL_KEYSTORE_PASSWORD: ##Base 64 encoded secret
 ```
 ## Create ssl-values.yaml file with following content.
```
existingSecret: "ssl-files"


env:
- name:  KAFKA_CLUSTERS_0_PROPERTIES_SSL_TRUSTSTORE_LOCATION 
  value:  /ssl/kafka.truststore.jks
- name: KAFKA_CLUSTERS_0_PROPERTIES_SSL_KEYSTORE_LOCATION
  value: /ssl/kafka.keystore.jks


volumeMounts:
 - name: config-volume
   mountPath: /ssl

volumes:
 - name: config-volume
   configMap:
     name: ssl-files
```

## Install chart with command
```
helm install kafka-ui kafka-ui/kafka-ui -f ssl-values.yaml
```
If you have specified namespace for configmap and secret please use this command

```
helm install kafka-ui kafka-ui/kafka-ui -f ssl-values.yaml -n {namespace}
```
