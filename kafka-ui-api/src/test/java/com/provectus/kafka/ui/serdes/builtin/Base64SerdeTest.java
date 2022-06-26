package com.provectus.kafka.ui.serdes.builtin;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.serdes.PropertyResolverImpl;
import org.apache.kafka.common.header.internals.RecordHeaders;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import java.util.Base64;

class Base64SerdeTest {

  private static final String TEST_STRING = "some test string in utf8";
  private static final String TEST_STRING_BASE64 = Base64.getEncoder().encodeToString(TEST_STRING.getBytes());
  private static final byte[] TEST_STRING_BASE64_BYTES = Base64.getDecoder().decode(TEST_STRING_BASE64);

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
  void serializesInputAsBase64String(Serde.Type type) {
    var serializer = base64Serde.serializer("anyTopic", type);
    byte[] bytes = serializer.serialize(TEST_STRING_BASE64);
    assertThat(bytes).isEqualTo(TEST_STRING_BASE64_BYTES);
  }

  @ParameterizedTest
  @EnumSource
  void deserializesDataAsBase64Bytes(Serde.Type type) {
    var deserializer = base64Serde.deserializer("anyTopic", type);
    var result = deserializer.deserialize(new RecordHeaders(), TEST_STRING_BASE64_BYTES);
    assertThat(result.getResult()).isEqualTo(TEST_STRING_BASE64);
    assertThat(result.getType()).isEqualTo(DeserializeResult.Type.STRING);
    assertThat(result.getAdditionalProperties()).isEmpty();
  }

  @ParameterizedTest
  @EnumSource
  void getSchemaReturnsEmpty(Serde.Type type) {
    assertThat(base64Serde.getSchema("anyTopic", type)).isEmpty();
  }

  @ParameterizedTest
  @EnumSource
  void canDeserializeReturnsTrueForAllInputs(Serde.Type type) {
    assertThat(base64Serde.canDeserialize("anyTopic", type)).isTrue();
  }

  @ParameterizedTest
  @EnumSource
  void canSerializeReturnsTrueForAllInput(Serde.Type type) {
    assertThat(base64Serde.canSerialize("anyTopic", type)).isTrue();
  }
}