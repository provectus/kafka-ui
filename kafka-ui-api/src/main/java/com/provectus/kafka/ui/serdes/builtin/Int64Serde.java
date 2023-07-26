package com.provectus.kafka.ui.serdes.builtin;

import com.google.common.primitives.Longs;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.RecordHeaders;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import java.util.Map;
import java.util.Optional;

public class Int64Serde implements BuiltInSerde {

  public static String name() {
    return "Int64";
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
                Long.MIN_VALUE,
                Long.MAX_VALUE
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
    return input -> Longs.toByteArray(Long.parseLong(input));
  }

  @Override
  public Deserializer deserializer(String topic, Target type) {
    return (headers, data) ->
        new DeserializeResult(
            String.valueOf(Longs.fromByteArray(data)),
            DeserializeResult.Type.JSON,
            Map.of()
        );
  }
}
