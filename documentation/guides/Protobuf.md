# Kafkaui Protobuf Support

Kafkaui supports deserializing protobuf messages in two ways:
1. Using Confluent Schema Registry's [protobuf support](https://docs.confluent.io/platform/current/schema-registry/serdes-develop/serdes-protobuf.html).
2. Supplying a protobuf file as well as a configuration that maps topic names to protobuf types.

## Configuring Kafkaui with a Protobuf File

To configure Kafkaui to deserialize protobuf messages using a supplied protobuf schema add the following to the config:
```yaml
kafka:
  clusters:
    - # Cluster configuration omitted.
      # protobufFile is the path to the protobuf schema. (deprecated: please use "protobufFiles")
      protobufFile: path/to/my.proto
      # protobufFiles is the path to one or more protobuf schemas.
      protobufFiles: 
          - path/to/my.proto
          - path/to/another.proto
      # protobufMessageName is the default protobuf type that is used to deserilize
      # the message's value if the topic is not found in protobufMessageNameByTopic.
      protobufMessageName: my.Type1
      # protobufMessageNameByTopic is a mapping of topic names to protobuf types.
      # This mapping is required and is used to deserialize the Kafka message's value.
      protobufMessageNameByTopic:
        topic1: my.Type1
        topic2: my.Type2
      # protobufMessageNameForKey is the default protobuf type that is used to deserilize
      # the message's key if the topic is not found in protobufMessageNameForKeyByTopic.
      protobufMessageNameForKey: my.Type1
      # protobufMessageNameForKeyByTopic is a mapping of topic names to protobuf types.
      # This mapping is optional and is used to deserialize the Kafka message's key.
      # If a protobuf type is not found for a topic's key, the key is deserialized as a string,
      # unless protobufMessageNameForKey is specified.
      protobufMessageNameForKeyByTopic:
        topic1: my.KeyType1
```