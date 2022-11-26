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

## Setup docker-compose to configure Kafkaui with a Protobuf File
If you are using a `docker-compose` please follow the setup below to configure Kafkaui
to deserialize protobuf messages using a supplied protobuf schema.
```dockerfile
  kafka-ui:
    container_name: kafka-ui
    image: provectuslabs/kafka-ui:<version>
    ports:
      - "8080:8080"
    depends_on:
      - kafka
    volumes:
      - host/path:/path/in/container
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
      KAFKA_CLUSTERS_0_PROTOBUFFILES_0: "/path/in/container/hello.proto"
      KAFKA_CLUSTERS_0_PROTOBUFMESSAGENAME: "my.Topic1"
      KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL: PLAINTEXT
      KAFKA_CLUSTERS_0_PROPERTIES_SASL_MECHANISM: PLAIN
      KAFKA_CLUSTERS_0_PROPERTIES_SASL_JAAS_CONFIG: 'org.apache.kafka.common.security.plain.PlainLoginModule required username="client" password="password";'
```
### Explanation of the docker-compose file
#### Mounting volumes for the proto schema
To deserialize Protobuf messages in Kafkaui, you must specify the proto schema specification.
In the preceding example, we have a proto schema called `hello.proto`. The file is located in the `host/path` directory.
Because Kafkaui will be executing in a Docker container, you must mount the host path in the volume of the container.
That's what we did in the `volumes` part in the docker-compose file.

#### Specifying the proto file in the environment variable
Now we need to inform Kafkaaui where the schema is so that it can parse it and deserialize the Kafka messages.
In the preceding example, the path to the proto schema is supplied in the environment variable 
`KAFKA_CLUSTERS_0_PROTOBUFFILES_0`. If you have more than one proto schema, you can refer to them by adding 
extra variables, like as
```dockerfile
kafka-ui:
    environment:
        KAFKA_CLUSTERS_0_PROTOBUFFILES_0: "/path/in/container/hello.proto"
        KAFKA_CLUSTERS_0_PROTOBUFFILES_1: "/path/in/container/world.proto"
```

#### Specifying the Type for a topic
Kafkaui needs to know the type of the topic that will be used to deserialize the topic messages.
Therefore, you also need to specify the type. In the preceding example we specified the type name
in the `KAFKA_CLUSTERS_0_PROTOBUFMESSAGENAME` variable