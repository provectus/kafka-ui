package com.provectus.kafka.ui.serdes.builtin;

import static org.assertj.core.api.Assertions.assertThat;

import com.google.common.primitives.Ints;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.serdes.PropertyResolverImpl;
import com.provectus.kafka.ui.serdes.RecordHeadersImpl;
import org.apache.kafka.common.header.internals.RecordHeaders;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class Int32SerdeTest {

  private Int32Serde serde;

  @BeforeEach
  void init() {
    serde = new Int32Serde();
    serde.configure(
        PropertyResolverImpl.empty(),
        PropertyResolverImpl.empty(),
        PropertyResolverImpl.empty()
    );
  }

  @ParameterizedTest
  @EnumSource
  void serializeUses4BytesIntRepresentation(Serde.Target type) {
    var serializer = serde.serializer("anyTopic", type);
    byte[] bytes = serializer.serialize("1234");
    assertThat(bytes).isEqualTo(Ints.toByteArray(1234));
  }

  @ParameterizedTest
  @EnumSource
  void deserializeUses4BytesIntRepresentation(Serde.Target type) {
    var deserializer = serde.deserializer("anyTopic", type);
    var result = deserializer.deserialize(new RecordHeadersImpl(), Ints.toByteArray(1234));
    assertThat(result.getResult()).isEqualTo("1234");
    assertThat(result.getType()).isEqualTo(DeserializeResult.Type.JSON);
  }

}