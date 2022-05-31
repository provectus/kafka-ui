package com.provectus.kafka.ui.newserde;

import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.newserde.spi.PropertyResolver;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.core.env.Environment;
import org.springframework.core.env.StandardEnvironment;

import javax.annotation.Nullable;
import java.util.List;
import java.util.Map;
import java.util.Optional;

class PropertyResolverImpl implements PropertyResolver {

  private final Environment env;
  private final String prefix;

  public static PropertyResolverImpl empty() {
    return new PropertyResolverImpl(new StandardEnvironment(), null);
  }

  public PropertyResolverImpl(Environment env, @Nullable String prefix) {
    this.env = env;
    this.prefix = prefix == null ? "" : prefix;
  }

  private String targetPropertyName(String key) {
    Preconditions.checkNotNull(key);
    Preconditions.checkState(!key.isBlank());
    return prefix.isEmpty() ? key : prefix + "." + key;
  }

  @Override
  public <T> Optional<T> getProperty(String key, Class<T> targetType) {
    String targetKey = targetPropertyName(key);
    var result = Binder.get(env).bind(targetKey, targetType);
    return result.isBound() ? Optional.of(result.get()) : Optional.empty();
  }

  @Override
  public <T> Optional<List<T>> getListProperty(String key, Class<T> itemType) {
    String targetKey = targetPropertyName(key);
    var listResult = Binder.get(env).bind(targetKey, Bindable.listOf(itemType));
    return listResult.isBound() ? Optional.of(listResult.get()) : Optional.empty();
  }

  @Override
  public <K, V> Optional<Map<K, V>> getMapProperty(String key, Class<K> keyType, Class<V> valueType) {
    String targetKey = targetPropertyName(key);
    var mapResult = Binder.get(env).bind(targetKey, Bindable.mapOf(keyType, valueType));
    return mapResult.isBound() ? Optional.of(mapResult.get()) : Optional.empty();
  }
}
