package com.provectus.kafka.ui.serdes;

import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serde.api.Serde;
import java.io.Closeable;
import java.util.Optional;
import java.util.function.Supplier;
import java.util.regex.Pattern;
import javax.annotation.Nullable;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public class SerdeInstance implements Closeable {

  @Getter
  private final String name;

  private final Serde serde;

  @Nullable
  final Pattern topicKeyPattern;

  @Nullable
  final Pattern topicValuePattern;

  @Nullable // will be set for custom serdes
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

  public Optional<SchemaDescription> getSchema(String topic, Serde.Target type) {
    return wrapWithClassloader(() -> serde.getSchema(topic, type));
  }

  public Optional<String> description() {
    return wrapWithClassloader(serde::getDescription);
  }

  public boolean canSerialize(String topic, Serde.Target type) {
    return wrapWithClassloader(() -> serde.canSerialize(topic, type));
  }

  public boolean canDeserialize(String topic, Serde.Target type) {
    return wrapWithClassloader(() -> serde.canDeserialize(topic, type));
  }

  public Serde.Serializer serializer(String topic, Serde.Target type) {
    return wrapWithClassloader(() -> {
      var serializer = serde.serializer(topic, type);
      return input -> wrapWithClassloader(() -> serializer.serialize(input));
    });
  }

  public Serde.Deserializer deserializer(String topic, Serde.Target type) {
    return wrapWithClassloader(() -> {
      var deserializer = serde.deserializer(topic, type);
      return (headers, data) -> wrapWithClassloader(() -> deserializer.deserialize(headers, data));
    });
  }

  @Override
  public void close() {
    wrapWithClassloader(() -> {
      try {
        serde.close();
      } catch (Exception e) {
        log.error("Error closing serde " + name, e);
      }
      return null;
    });
  }
}
