package com.provectus.kafka.ui.serde.api;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface PropertyResolver {

  <T> Optional<T> getProperty(String key, Class<T> targetType);

  <T> Optional<List<T>> getListProperty(String key, Class<T> itemType);

  <K, V> Optional<Map<K, V>> getMapProperty(String key, Class<K> keyType, Class<V> valueType);

}