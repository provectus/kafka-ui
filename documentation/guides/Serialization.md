## Serialization and deserialization and custom plugins

Kafka-ui supports multiple ways to serialize/deserialize data.


### Int32, Int64, UInt32, UInt64
Big-endian 4/8 bytes representation of signed/unsigned integers.

### Base64
Base64 (RFC4648) binary data representation. Can be useful in case if the actual data is not important, but exactly the same (byte-wise) key/value should be send.

### String 
Treats binary data as a string in specified encoding. Default encoding is UTF-8.

Class name: `com.provectus.kafka.ui.serdes.builtin.StringSerde`

Sample configuration (if you want to overwrite default configuration):
```yaml
kafka:
  clusters:
    - name: Cluster1
      # Other Cluster configuration omitted ... 
      serdes:
          # registering String serde with custom config
        - name: AsciiString
          className: com.provectus.kafka.ui.serdes.builtin.StringSerde
          properties:
            encoding: "ASCII"
        
          # overriding build-it String serde config   
        - name: String 
          properties:
            encoding: "UTF-16"
```

### Protobuf
[Deprecated configuration is here](Protobuf.md)

Class name: `com.provectus.kafka.ui.serdes.builtin.ProtobufFileSerde`

Sample configuration:
```yaml
kafka:
  clusters:
    - name: Cluster1
      # Other Cluster configuration omitted ... 
      serdes:
        - name: ProtobufFile
          properties:
            # path to the protobuf schema file
            protobufFile: path/to/my.proto
            # default protobuf type that is used for KEY serialization/deserialization
            # optional
            protobufMessageNameForKey: my.Type1
            # mapping of topic names to protobuf types, that will be used for KEYS  serialization/deserialization
            # optional
            protobufMessageNameForKeyByTopic:
              topic1: my.KeyType1
              topic2: my.KeyType2
            # default protobuf type that is used for VALUE serialization/deserialization
            # optional, if not set - first type in file will be used as default
            protobufMessageName: my.Type1
            # mapping of topic names to protobuf types, that will be used for VALUES  serialization/deserialization
            # optional
            protobufMessageNameByTopic:
              topic1: my.Type1
              topic2: my.Type2
```

### SchemaRegistry
SchemaRegistry serde is automatically configured if schema registry properties set on cluster level.
But you can override them or add new SchemaRegistry serde that will connect to another schema-registry instance. 

Class name: `com.provectus.kafka.ui.serdes.builtin.sr.SchemaRegistrySerde`

Sample configuration:
```yaml
kafka:
  clusters:
    - name: Cluster1
      # this schema-registry will be used by SchemaRegistrySerde by default
      schemaRegistry: http://main-schema-registry:8081
      serdes:
        - name: SchemaRegistry
          properties:
            # but you can override cluster-level properties
            url:  http://another-schema-registry:8081
            # auth properties, optional
            username: nameForAuth
            password: P@ssW0RdForAuth
        
          # and also add another SchemaRegistry serde
        - name: AnotherOneSchemaRegistry
          className: com.provectus.kafka.ui.serdes.builtin.sr.SchemaRegistrySerde
          properties:
            url:  http://another-yet-schema-registry:8081
            username: nameForAuth_2
            password: P@ssW0RdForAuth_2
```

## Setting serdes for specific topics
You can specify preferable serde for topics key/value. This serde will be chosen by default in UI on topic's view/produce pages. 
To do so, set `topicValuesPattern/topicValuesPattern` properties for the selected serde. Kafka-ui will choose a first serde that matches specified pattern.

Sample configuration:
```yaml
kafka:
  clusters:
    - name: Cluster1
      serdes:
        - name: String
          topicKeysPattern: click-events|imp-events
        
        - name: Int64
          topicKeysPattern: ".*-events"
        
        - name: SchemaRegistry
          properties:
            url:  http://schema-registry:8081
          topicValuesPattern: click-events|imp-events
```


## Default serdes
You can specify which serde will be chosen in UI by default if no other serdes selected via `topicKeysPattern/topicValuesPattern` settings.

Sample configuration:
```yaml
kafka:
  clusters:
    - name: Cluster1
      defaultKeySerde: Int34
      defaultValueSerde: String
      serdes:
        - name: Int32
          topicKeysPattern: click-events|imp-events
```

## Fallback
If selected serde couldn't be applied (exception was thrown), then fallback (String serde with UTF-8 encoding) serde will be applied. Such messages will be specially highlighted in UI.

## Custom pluggable serde registration
You can implement your own serde and register it in kafka-ui application.
To do so:
1. Add `kafka-ui-serde-api` dependency (should be downloadable via maven central)
2. Implement `com.provectus.kafka.ui.serde.api.Serde` interface. See javadoc for implementation requirements.
3. Pack your serde into uber jar, or provide directory with no-dependency jar and it's dependencies jars


Example pluggable serdes :
https://github.com/provectus/kafkaui-smile-serde
https://github.com/provectus/kafkaui-glue-sr-serde

Sample configuration:
```yaml
kafka:
  clusters:
    - name: Cluster1
      serdes:
        - name: MyCustomSerde
          className: my.lovely.org.KafkaUiSerde
          filePath: /var/lib/kui-serde/my-kui-serde.jar
          
        - name: MyCustomSerde2
          className: my.lovely.org.KafkaUiSerde2
          filePath: /var/lib/kui-serde2
          properties:
            prop1: v1
```
