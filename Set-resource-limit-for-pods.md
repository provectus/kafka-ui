# How to set resource limit for pods.

## Set limits via changing values.yaml

To set or change resource limit for pods need to create file values.yaml and add following lines

```
resources:
   limits:
     cpu: 200m
     memory: 512Mi
   requests:
     cpu: 200m
     memory: 256Mi
```

Specify values.yaml file during chart install

```
helm install kafka-ui kafka-ui/kafka-ui -f values.yaml
```

## Set limits in command line.

To set limit via command line need to specify limits in helm install command.

```
helm install kafka-ui kafka-ui/kafka-ui --set resources.limits.cpu=200m --set resources.limits.memory=512Mi --set resources.requests.memory=256Mi --set resources.requests.cpu=200m 
```
