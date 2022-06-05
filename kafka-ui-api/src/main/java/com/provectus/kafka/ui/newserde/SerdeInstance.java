package com.provectus.kafka.ui.newserde;

import com.provectus.kafka.ui.newserde.spi.SchemaDescription;
import com.provectus.kafka.ui.newserde.spi.Serde;
import lombok.AllArgsConstructor;
import lombok.Getter;

import javax.annotation.Nullable;
import java.util.Optional;
import java.util.function.Supplier;
import java.util.regex.Pattern;

@AllArgsConstructor
public class SerdeInstance {

  @Getter
  private final String name;

  private final Serde serde;

  @Nullable
  final Pattern topicKeyPattern;

  @Nullable
  final Pattern topicValuePattern;

  @Nullable // will be non-null for custom serde
  private final ClassLoader classLoader;

  private <T> T wrapWithClassloader(Supplier<T> call) {
    if (classLoader == null) {
      return call.get();
    }
    var origCl = ClassloaderUtil.compareAndSwapLoaders(classLoader);
    try {
      return call.get();
    } finally {
      ClassloaderUtil.compareAndSwapLoaders(origCl);
    }
  }

  public Optional<SchemaDescription> getSchema(String topic, Serde.Type type) {
    return wrapWithClassloader(() -> serde.getSchema(topic, type));
  }

  public Optional<String> description() {
    return wrapWithClassloader(serde::description);
  }

  public boolean canSerialize(String topic, Serde.Type type) {
    return wrapWithClassloader(() -> serde.canSerialize(topic, type));
  }

  public boolean canDeserialize(String topic, Serde.Type type) {
    return wrapWithClassloader(() -> serde.canDeserialize(topic, type));
  }

  public Serde.Serializer serializer(String topic, Serde.Type type) {
    return wrapWithClassloader(() -> {
      var serializer = serde.serializer(topic, type);
      return (top, input) -> wrapWithClassloader(() -> serializer.serialize(top, input));
    });
  }

  public Serde.Deserializer deserializer(String topic, Serde.Type type) {
    return wrapWithClassloader(() -> {
      var deserializer = serde.deserializer(topic, type);
      return (top, headers, data) -> wrapWithClassloader(() -> deserializer.deserialize(top, headers, data));
    });
  }
}
