package com.provectus.kafka.ui.serdes.builtin;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.serdes.PropertyResolverImpl;
import com.provectus.kafka.ui.serdes.RecordHeadersImpl;
import java.util.Base64;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class Base64SerdeTest {

  private static final byte[] TEST_BYTES = "some bytes go here".getBytes();
  private static final String TEST_BYTES_BASE64_ENCODED = Base64.getEncoder().encodeToString(TEST_BYTES);

  private Serde base64Serde;

  @BeforeEach
  void init() {
    base64Serde = new Base64Serde();
    base64Serde.configure(
        PropertyResolverImpl.empty(),
        PropertyResolverImpl.empty(),
        PropertyResolverImpl.empty()
    );
  }

  @ParameterizedTest
  @EnumSource
  void serializesInputAsBase64String(Serde.Target type) {
    var serializer = base64Serde.serializer("anyTopic", type);
    byte[] bytes = serializer.serialize(TEST_BYTES_BASE64_ENCODED);
    assertThat(bytes).isEqualTo(TEST_BYTES);
  }

  @ParameterizedTest
  @EnumSource
  void deserializesDataAsBase64Bytes(Serde.Target type) {
    var deserializer = base64Serde.deserializer("anyTopic", type);
    var result = deserializer.deserialize(new RecordHeadersImpl(), TEST_BYTES);
    assertThat(result.getResult()).isEqualTo(TEST_BYTES_BASE64_ENCODED);
    assertThat(result.getType()).isEqualTo(DeserializeResult.Type.STRING);
    assertThat(result.getAdditionalProperties()).isEmpty();
  }

  @ParameterizedTest
  @EnumSource
  void getSchemaReturnsEmpty(Serde.Target type) {
    assertThat(base64Serde.getSchema("anyTopic", type)).isEmpty();
  }

  @ParameterizedTest
  @EnumSource
  void canDeserializeReturnsTrueForAllInputs(Serde.Target type) {
    assertThat(base64Serde.canDeserialize("anyTopic", type)).isTrue();
  }

  @ParameterizedTest
  @EnumSource
  void canSerializeReturnsTrueForAllInput(Serde.Target type) {
    assertThat(base64Serde.canSerialize("anyTopic", type)).isTrue();
  }
}