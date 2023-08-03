package com.provectus.kafka.ui.serdes.builtin;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.serdes.PropertyResolverImpl;
import com.provectus.kafka.ui.serdes.RecordHeadersImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;

public class HexSerdeTest {

  private static final byte[] TEST_BYTES = "hello world".getBytes();
  private static final String TEST_BYTES_HEX_ENCODED = "68 65 6C 6C 6F 20 77 6F 72 6C 64";

  private HexSerde hexSerde;

  @BeforeEach
  void init() {
    hexSerde = new HexSerde();
    hexSerde.autoConfigure(PropertyResolverImpl.empty(), PropertyResolverImpl.empty());
  }


  @ParameterizedTest
  @CsvSource({
      "68656C6C6F20776F726C64", // uppercase
      "68656c6c6f20776f726c64", // lowercase
      "68:65:6c:6c:6f:20:77:6f:72:6c:64", // ':' delim
      "68 65 6C 6C 6F 20 77 6F 72 6C 64", // space delim, UC
      "68 65 6c 6c 6f 20 77 6f 72 6c 64", // space delim, LC
      "#68 #65 #6C #6C #6F #20 #77 #6F #72 #6C #64"  // '#' prefix, space delim
  })
  void serializesInputAsHexString(String hexString) {
    for (Serde.Target type : Serde.Target.values()) {
      var serializer = hexSerde.serializer("anyTopic", type);
      byte[] bytes = serializer.serialize(hexString);
      assertThat(bytes).isEqualTo(TEST_BYTES);
    }
  }

  @ParameterizedTest
  @EnumSource
  void serializesEmptyStringAsEmptyBytesArray(Serde.Target type) {
    var serializer = hexSerde.serializer("anyTopic", type);
    byte[] bytes = serializer.serialize("");
    assertThat(bytes).isEqualTo(new byte[] {});
  }

  @ParameterizedTest
  @EnumSource
  void deserializesDataAsHexBytes(Serde.Target type) {
    var deserializer = hexSerde.deserializer("anyTopic", type);
    var result = deserializer.deserialize(new RecordHeadersImpl(), TEST_BYTES);
    assertThat(result.getResult()).isEqualTo(TEST_BYTES_HEX_ENCODED);
    assertThat(result.getType()).isEqualTo(DeserializeResult.Type.STRING);
    assertThat(result.getAdditionalProperties()).isEmpty();
  }

  @ParameterizedTest
  @EnumSource
  void getSchemaReturnsEmpty(Serde.Target type) {
    assertThat(hexSerde.getSchema("anyTopic", type)).isEmpty();
  }

  @ParameterizedTest
  @EnumSource
  void canDeserializeReturnsTrueForAllInputs(Serde.Target type) {
    assertThat(hexSerde.canDeserialize("anyTopic", type)).isTrue();
  }

  @ParameterizedTest
  @EnumSource
  void canSerializeReturnsTrueForAllInput(Serde.Target type) {
    assertThat(hexSerde.canSerialize("anyTopic", type)).isTrue();
  }
}
