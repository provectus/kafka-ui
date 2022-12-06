package com.provectus.kafka.ui.serdes;

import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.serdes.builtin.StringSerde;
import java.io.Closeable;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public class ClusterSerdes implements Closeable {

  final Map<String, SerdeInstance> serdes;

  @Nullable
  final SerdeInstance defaultKeySerde;

  @Nullable
  final SerdeInstance defaultValueSerde;

  @Getter
  final SerdeInstance fallbackSerde;

  private Optional<SerdeInstance> findSerdeByPatternsOrDefault(String topic,
                                                               Serde.Target type,
                                                               Predicate<SerdeInstance> additionalCheck) {
    // iterating over serdes in the same order they were added in config
    for (SerdeInstance serdeInstance : serdes.values()) {
      var pattern = type == Serde.Target.KEY
          ? serdeInstance.topicKeyPattern
          : serdeInstance.topicValuePattern;
      if (pattern != null
          && pattern.matcher(topic).matches()
          && additionalCheck.test(serdeInstance)) {
        return Optional.of(serdeInstance);
      }
    }
    if (type == Serde.Target.KEY
        && defaultKeySerde != null
        && additionalCheck.test(defaultKeySerde)) {
      return Optional.of(defaultKeySerde);
    }
    if (type == Serde.Target.VALUE
        && defaultValueSerde != null
        && additionalCheck.test(defaultValueSerde)) {
      return Optional.of(defaultValueSerde);
    }
    return Optional.empty();
  }

  public Optional<SerdeInstance> serdeForName(String name) {
    return Optional.ofNullable(serdes.get(name));
  }

  public Stream<SerdeInstance> all() {
    return serdes.values().stream();
  }

  public SerdeInstance suggestSerdeForSerialize(String topic, Serde.Target type) {
    return findSerdeByPatternsOrDefault(topic, type, s -> s.canSerialize(topic, type))
        .orElse(serdes.get(StringSerde.name()));
  }

  public SerdeInstance suggestSerdeForDeserialize(String topic, Serde.Target type) {
    return findSerdeByPatternsOrDefault(topic, type, s -> s.canDeserialize(topic, type))
        .orElse(serdes.get(StringSerde.name()));
  }

  @Override
  public void close() {
    serdes.values().forEach(SerdeInstance::close);
  }
}
