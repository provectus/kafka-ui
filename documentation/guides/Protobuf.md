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
      # protobufFile is the path to the protobuf schema.
      protobufFile: path/to/my.proto
      # protobufMessageNameByTopic is a mapping of topic names to protobuf types.
      # This mapping is required and is used to deserialize the Kafka message's value.
      protobufMessageNameByTopic:
        topic1: my.Type1
        topic2: my.Type2
      # protobufMessageNameForKeyByTopic is a mapping of topic names to protobuf types.
      # This mapping is optional and is used to deserialize the Kafka message's key.
      # If a protobuf type is not found for a topic's key, the key is deserialized as a string.
      protobufMessageNameForKeyByTopic:
        topic1: my.KeyType1
```