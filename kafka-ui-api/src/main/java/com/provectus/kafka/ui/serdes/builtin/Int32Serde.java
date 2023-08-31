package com.provectus.kafka.ui.serdes.builtin;

import com.google.common.primitives.Ints;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import java.util.Map;
import java.util.Optional;

public class Int32Serde implements BuiltInSerde {

  public static String name() {
    return "Int32";
  }

  @Override
  public Optional<String> getDescription() {
    return Optional.empty();
  }

  @Override
  public Optional<SchemaDescription> getSchema(String topic, Target type) {
    return Optional.of(
        new SchemaDescription(
            String.format(
                "{ "
                    + "  \"type\" : \"integer\", "
                    + "  \"minimum\" : %s, "
                    + "  \"maximum\" : %s "
                    + "}",
                Integer.MIN_VALUE,
                Integer.MAX_VALUE
            ),
            Map.of()
        )
    );
  }

  @Override
  public boolean canDeserialize(String topic, Target type) {
    return true;
  }

  @Override
  public boolean canSerialize(String topic, Target type) {
    return true;
  }

  @Override
  public Serializer serializer(String topic, Target type) {
    return input -> Ints.toByteArray(Integer.parseInt(input));
  }

  @Override
  public Deserializer deserializer(String topic, Target type) {
    return (headers, data) ->
        new DeserializeResult(
            String.valueOf(Ints.fromByteArray(data)),
            DeserializeResult.Type.JSON,
            Map.of()
        );
  }
}
