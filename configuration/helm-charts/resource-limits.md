---
description: How to set up resource limits
---

# Resource limits

There are two options:

### Set limits via changing values.yaml

To set or change resource limits for pods you need to create the file `values.yaml` and add the following lines:

```
resources:
   limits:
     cpu: 200m
     memory: 512Mi
   requests:
     cpu: 200m
     memory: 256Mi
```

Specify `values.yaml` file during chart install

```
helm install kafka-ui kafka-ui/kafka-ui -f values.yaml
```

### Set limits via CLI

To set limits via CLI you need to specify limits with helm install command.

```
helm install kafka-ui kafka-ui/kafka-ui --set resources.limits.cpu=200m --set resources.limits.memory=512Mi --set resources.requests.memory=256Mi --set resources.requests.cpu=200m 
```
