package com.provectus.kafka.ui.serdes.builtin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.google.protobuf.DescriptorProtos;
import com.google.protobuf.Descriptors;
import com.google.protobuf.DynamicMessage;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.serde.api.Serde;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ProtobufRawSerdeTest {

  private static final String DUMMY_TOPIC = "dummy-topic";

  private ProtobufRawSerde serde;

  @BeforeEach
  void init() {
    serde = new ProtobufRawSerde();
  }

  @SneakyThrows
  ProtobufSchema getSampleSchema() {
    return new ProtobufSchema(
        """
          syntax = "proto3";
          message Message1 {
            int32 my_field = 1;
          }
        """
    );
  }

  @SneakyThrows
  private byte[] getProtobufMessage() {
    DynamicMessage.Builder builder = DynamicMessage.newBuilder(getSampleSchema().toDescriptor("Message1"));
    builder.setField(builder.getDescriptorForType().findFieldByName("my_field"), 5);
    return builder.build().toByteArray();
  }

  @Test
  void deserializeSimpleMessage() {
    var deserialized = serde.deserializer(DUMMY_TOPIC, Serde.Target.VALUE)
        .deserialize(null, getProtobufMessage());
    assertThat(deserialized.getResult()).isEqualTo("1: 5\n");
  }

  @Test
  void deserializeEmptyMessage() {
    var deserialized = serde.deserializer(DUMMY_TOPIC, Serde.Target.VALUE)
        .deserialize(null, new byte[0]);
    assertThat(deserialized.getResult()).isEqualTo("");
  }

  @Test
  void deserializeInvalidMessage() {
    var deserializer = serde.deserializer(DUMMY_TOPIC, Serde.Target.VALUE);
    assertThatThrownBy(() -> deserializer.deserialize(null, new byte[] { 1, 2, 3 }))
        .isInstanceOf(ValidationException.class)
        .hasMessageContaining("Protocol message contained an invalid tag");
  }
  
  @Test
  void deserializeNullMessage() {
    var deserializer = serde.deserializer(DUMMY_TOPIC, Serde.Target.VALUE);
    assertThatThrownBy(() -> deserializer.deserialize(null, null))
        .isInstanceOf(ValidationException.class)
        .hasMessageContaining("Cannot read the array length");
  }

  ProtobufSchema getSampleNestedSchema() {
    return new ProtobufSchema(
      """
        syntax = "proto3";
        message Message2 {
          int32 my_nested_field = 1;
        }
        message Message1 {
          int32 my_field = 1;
          Message2 my_nested_message = 2;
        }
      """
    );
  }

  @SneakyThrows
  private byte[] getComplexProtobufMessage() {
    DynamicMessage.Builder builder = DynamicMessage.newBuilder(getSampleNestedSchema().toDescriptor("Message1"));
    builder.setField(builder.getDescriptorForType().findFieldByName("my_field"), 5);
    DynamicMessage.Builder nestedBuilder = DynamicMessage.newBuilder(getSampleNestedSchema().toDescriptor("Message2"));
    nestedBuilder.setField(nestedBuilder.getDescriptorForType().findFieldByName("my_nested_field"), 10);
    builder.setField(builder.getDescriptorForType().findFieldByName("my_nested_message"), nestedBuilder.build());

    return builder.build().toByteArray();
  }

  @Test
  void deserializeNestedMessage() {
    var deserialized = serde.deserializer(DUMMY_TOPIC, Serde.Target.VALUE)
        .deserialize(null, getComplexProtobufMessage());
    assertThat(deserialized.getResult()).isEqualTo("1: 5\n2: {\n  1: 10\n}\n");
  }
}