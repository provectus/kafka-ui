package com.provectus.kafka.ui.serdes;

import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.annotation.Nullable;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.context.properties.source.ConfigurationPropertyName;
import org.springframework.core.env.Environment;
import org.springframework.core.env.StandardEnvironment;


public class PropertyResolverImpl implements PropertyResolver {

  private final Binder binder;

  @Nullable
  private final String prefix;

  public static PropertyResolverImpl empty() {
    return new PropertyResolverImpl(new StandardEnvironment(), null);
  }

  public PropertyResolverImpl(Environment env) {
    this(env, null);
  }

  public PropertyResolverImpl(Environment env, @Nullable String prefix) {
    this.binder = Binder.get(env);
    this.prefix = prefix;
  }

  private ConfigurationPropertyName targetPropertyName(String key) {
    Preconditions.checkNotNull(key);
    Preconditions.checkState(!key.isBlank());
    String propertyName = prefix == null ? key : prefix + "." + key;
    return ConfigurationPropertyName.adapt(propertyName, '.');
  }

  @Override
  public <T> Optional<T> getProperty(String key, Class<T> targetType) {
    var targetKey = targetPropertyName(key);
    var result = binder.bind(targetKey, Bindable.of(targetType));
    return result.isBound() ? Optional.of(result.get()) : Optional.empty();
  }

  @Override
  public <T> Optional<List<T>> getListProperty(String key, Class<T> itemType) {
    var targetKey = targetPropertyName(key);
    var listResult = binder.bind(targetKey, Bindable.listOf(itemType));
    return listResult.isBound() ? Optional.of(listResult.get()) : Optional.empty();
  }

  @Override
  public <K, V> Optional<Map<K, V>> getMapProperty(String key, Class<K> keyType, Class<V> valueType) {
    var targetKey = targetPropertyName(key);
    var mapResult = binder.bind(targetKey, Bindable.mapOf(keyType, valueType));
    return mapResult.isBound() ? Optional.of(mapResult.get()) : Optional.empty();
  }

}
