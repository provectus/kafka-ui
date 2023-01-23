---
description: ACLs required to run the app
---

# Required ACLs

## Standalone kafka

This list is enough to run the app in r/o mode

```
 Permission |    Operation     | ResourceType | ResourceName  | PatternType
------------+------------------+--------------+---------------+--------------
 ALLOW      | READ             | TOPIC        | *             | LITERAL
 ALLOW      | DESCRIBE_CONFIGS | TOPIC        | *             | LITERAL
 ALLOW      | DESCRIBE         | GROUP        | *             | LITERAL
 ALLOW      | DESCRIBE         | CLUSTER      | kafka-cluster | LITERAL
 ALLOW      | DESCRIBE_CONFIGS | CLUSTER      | kafka-cluster | LITERAL
```

## MSK

```
      "kafka-cluster:Connect",
      "kafka-cluster:Describe*",
      "kafka-cluster:CreateTopic",
      "kafka-cluster:AlterGroup",
      "kafka-cluster:ReadData"
```
