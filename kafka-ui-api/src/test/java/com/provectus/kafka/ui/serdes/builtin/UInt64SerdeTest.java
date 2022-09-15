package com.provectus.kafka.ui.serdes.builtin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.google.common.primitives.Longs;
import com.google.common.primitives.UnsignedLong;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.serdes.PropertyResolverImpl;
import com.provectus.kafka.ui.serdes.RecordHeadersImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class UInt64SerdeTest {

  private UInt64Serde serde;

  @BeforeEach
  void init() {
    serde = new UInt64Serde();
    serde.configure(
        PropertyResolverImpl.empty(),
        PropertyResolverImpl.empty(),
        PropertyResolverImpl.empty()
    );
  }

  @ParameterizedTest
  @EnumSource
  void serializeUses8BytesUInt64Representation(Serde.Target type) {
    var serializer = serde.serializer("anyTopic", type);
    String uint64String = UnsignedLong.MAX_VALUE.toString();
    byte[] bytes = serializer.serialize(uint64String);
    assertThat(bytes).isEqualTo(Longs.toByteArray(UnsignedLong.MAX_VALUE.longValue()));
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
  void deserializeUses8BytesUIn64tRepresentation(Serde.Target type) {
    var deserializer = serde.deserializer("anyTopic", type);
    byte[] uint64Bytes = Longs.toByteArray(UnsignedLong.MAX_VALUE.longValue());
    var result = deserializer.deserialize(new RecordHeadersImpl(), uint64Bytes);
    assertThat(result.getResult()).isEqualTo(UnsignedLong.MAX_VALUE.toString());
    assertThat(result.getType()).isEqualTo(DeserializeResult.Type.JSON);
  }

}