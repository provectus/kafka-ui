package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.util.annotations.KafkaClientInternalsDependant;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.schemaregistry.json.JsonSchema;
import io.confluent.kafka.serializers.json.KafkaJsonSchemaSerializer;
import io.confluent.kafka.serializers.json.KafkaJsonSchemaSerializerConfig;
import java.io.IOException;
import java.util.Map;
import org.apache.kafka.common.serialization.Serializer;

public class JsonSchemaMessageReader extends MessageReader<JsonNode> {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  public JsonSchemaMessageReader(String topic,
                                 boolean isKey,
                                 SchemaRegistryClient client,
                                 SchemaMetadata schema) throws IOException, RestClientException {
    super(topic, isKey, client, schema);
  }

  @Override
  protected Serializer<JsonNode> createSerializer(SchemaRegistryClient client) {
    var serializer = new KafkaJsonSchemaSerializerWithoutSchemaInfer(client);
    serializer.configure(
        Map.of(
            "schema.registry.url", "wontbeused",
            KafkaJsonSchemaSerializerConfig.AUTO_REGISTER_SCHEMAS, false,
            KafkaJsonSchemaSerializerConfig.USE_LATEST_VERSION, true
        ),
        isKey
    );
    return serializer;
  }

  @Override
  protected JsonNode read(String value, ParsedSchema schema) {
    try {
      return MAPPER.readTree(value);
    } catch (JsonProcessingException e) {
      throw new ValidationException(String.format("'%s' is not valid json", value));
    }
  }

  @KafkaClientInternalsDependant
  private class KafkaJsonSchemaSerializerWithoutSchemaInfer
      extends KafkaJsonSchemaSerializer<JsonNode> {

    KafkaJsonSchemaSerializerWithoutSchemaInfer(SchemaRegistryClient client) {
      super(client);
    }

    /**
     * Need to override original method because it tries to infer schema from input
     * by checking 'schema' json field or @Schema annotation on input class, which is not
     * possible in our case. So, we just skip all infer logic and pass schema directly.
     */
    @Override
    public byte[] serialize(String topic, JsonNode record) {
      return super.serializeImpl(
          super.getSubjectName(topic, isKey, record, schema),
          record,
          (JsonSchema) schema
      );
    }
  }

}
