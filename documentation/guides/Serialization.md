## Serialization and deserialization 

Kafka-ui supports multiple way serialize/deserialize data.


### Int32, Int64, UInt32, UInt64
Big-endian 4/8 bytes representation of signed/unsigned integers.

### Base64
Base64 (RFC4648) binary data representation. Can be useful when actual data is not important, but exactly the same (byte-wise) key/value should be send.

### String 
Treats binary data as a string in specified encoding. Default encoding is UTF-8.

Class name: `com.provectus.kafka.ui.serdes.builtin.StringSerde`

Sample configuration:
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

## Default serdes

## Setting serdes for specific topics

By deafult kafka-

1. how patterns work
2. default key & value serdes
3. fallback
4. how to pack pluggable serdes (jar/zip/folder)