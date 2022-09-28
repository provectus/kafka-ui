package com.provectus.kafka.ui.serdes.builtin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.google.common.primitives.Ints;
import com.google.common.primitives.UnsignedInteger;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.serdes.PropertyResolverImpl;
import com.provectus.kafka.ui.serdes.RecordHeadersImpl;
import org.apache.kafka.common.header.internals.RecordHeaders;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class UInt32SerdeTest {

  private UInt32Serde serde;

  @BeforeEach
  void init() {
    serde = new UInt32Serde();
    serde.configure(
        PropertyResolverImpl.empty(),
        PropertyResolverImpl.empty(),
        PropertyResolverImpl.empty()
    );
  }

  @ParameterizedTest
  @EnumSource
  void serializeUses4BytesUInt32Representation(Serde.Target type) {
    var serializer = serde.serializer("anyTopic", type);
    String uint32String = UnsignedInteger.MAX_VALUE.toString();
    byte[] bytes = serializer.serialize(uint32String);
    assertThat(bytes).isEqualTo(Ints.toByteArray(UnsignedInteger.MAX_VALUE.intValue()));
  }

  @ParameterizedTest
  @EnumSource
  void serializeThrowsNfeIfNegativeValuePassed(Serde.Target type) {
    var serializer = serde.serializer("anyTopic", type);
    String negativeIntString = "-100";
    assertThatThrownBy(() -> serializer.serialize(negativeIntString))
        .isInstanceOf(NumberFormatException.class);
  }

  @ParameterizedTest
  @EnumSource
  void deserializeUses4BytesUInt32Representation(Serde.Target type) {
    var deserializer = serde.deserializer("anyTopic", type);
    byte[] uint32Bytes = Ints.toByteArray(UnsignedInteger.MAX_VALUE.intValue());
    var result = deserializer.deserialize(new RecordHeadersImpl(), uint32Bytes);
    assertThat(result.getResult()).isEqualTo(UnsignedInteger.MAX_VALUE.toString());
    assertThat(result.getType()).isEqualTo(DeserializeResult.Type.JSON);
  }

}