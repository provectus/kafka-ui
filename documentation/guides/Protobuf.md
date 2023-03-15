# Kafkaui Protobuf Support

### This document is deprecated, please see examples in [Serialization document](Serialization.md).

Kafkaui supports deserializing protobuf messages in two ways:
1. Using Confluent Schema Registry's [protobuf support](https://docs.confluent.io/platform/current/schema-registry/serdes-develop/serdes-protobuf.html).
2. Supplying a protobuf file as well as a configuration that maps topic names to protobuf types.

## Configuring Kafkaui with a Protobuf File

To configure Kafkaui to deserialize protobuf messages using a supplied protobuf schema add the following to the config:
```yaml
kafka:
  clusters:
    - # Cluster configuration omitted...
      # protobufFilesDir specifies root location for proto files (will be scanned recursively)
      # NOTE: if 'protobufFilesDir' specified, then 'protobufFile' and 'protobufFiles' settings will be ignored
      protobufFilesDir: "/path/to/my-protobufs"
      # (DEPRECATED) protobufFile is the path to the protobuf schema. (deprecated: please use "protobufFiles")
      protobufFile: path/to/my.proto
      # (DEPRECATED) protobufFiles is the location of one or more protobuf schemas
      protobufFiles:
        - /path/to/my-protobufs/my.proto
        - /path/to/my-protobufs/another.proto
        - /path/to/my-protobufs:test/test.proto
      # protobufMessageName is the default protobuf type that is used to deserialize
      # the message's value if the topic is not found in protobufMessageNameByTopic.    
      protobufMessageName: my.DefaultValType
      # protobufMessageNameByTopic is a mapping of topic names to protobuf types.
      # This mapping is required and is used to deserialize the Kafka message's value.
      protobufMessageNameByTopic:
        topic1: my.Type1
        topic2: my.Type2
      # protobufMessageNameForKey is the default protobuf type that is used to deserialize
      # the message's key if the topic is not found in protobufMessageNameForKeyByTopic.
      protobufMessageNameForKey: my.DefaultKeyType
      # protobufMessageNameForKeyByTopic is a mapping of topic names to protobuf types.
      # This mapping is optional and is used to deserialize the Kafka message's key.
      # If a protobuf type is not found for a topic's key, the key is deserialized as a string,
      # unless protobufMessageNameForKey is specified.
      protobufMessageNameForKeyByTopic:
        topic1: my.KeyType1
```

Same config with flattened config (for docker-compose):

```text
kafka.clusters.0.protobufFiles.0: /path/to/my.proto
kafka.clusters.0.protobufFiles.1: /path/to/another.proto
kafka.clusters.0.protobufMessageName: my.DefaultValType
kafka.clusters.0.protobufMessageNameByTopic.topic1: my.Type1
kafka.clusters.0.protobufMessageNameByTopic.topic2: my.Type2
kafka.clusters.0.protobufMessageNameForKey: my.DefaultKeyType
kafka.clusters.0.protobufMessageNameForKeyByTopic.topic1: my.KeyType1
```