package com.provectus.kafka.ui.newserde;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableMap;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.newserde.impl.LongSerde;
import com.provectus.kafka.ui.newserde.impl.StringSerde;
import com.provectus.kafka.ui.newserde.spi.PropertyResolver;
import com.provectus.kafka.ui.newserde.spi.Serde;
import javax.annotation.Nullable;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import lombok.Getter;
import lombok.SneakyThrows;
import lombok.Value;
import org.springframework.core.env.Environment;

public class SerdeRegistry {

  private static final CustomSerdeLoader CUSTOM_SERDE_LOADER = new CustomSerdeLoader();

  private static final Map<String, Class<? extends Serde>> BUILT_IN_SERDES =
      ImmutableMap.<String, Class<? extends Serde>>builder()
          .put("Long", LongSerde.class)
          .put("String", StringSerde.class)
          .build();

  private final Map<String, SerdeInstance> serdes = new ConcurrentHashMap<>();

  @Getter
  private final SerdeInstance defaultKeySerde;

  @Getter
  private final SerdeInstance defaultValueSerde;

  public SerdeRegistry(Environment env,
                       ClustersProperties clustersProperties,
                       int clusterIndex) {
    var globalPropertiesResolver = new PropertyResolverImpl(env, null);
    var clusterPropertiesResolver = new PropertyResolverImpl(env, "kafka.clusters." + clusterIndex);

    // initializing serdes from config
    ClustersProperties.Cluster clusterProp = clustersProperties.getClusters().get(clusterIndex);
    for (int i = 0; i < clusterProp.getSerde().size(); i++) {
      var sendeConf = clusterProp.getSerde().get(i);
      var instance = init(
          sendeConf,
          new PropertyResolverImpl(env, "kafka.clusters." + clusterIndex + ".serde." + i),
          clusterPropertiesResolver,
          globalPropertiesResolver
      );
      if (serdes.containsKey(sendeConf.getName())) {
        throw new IllegalStateException("Multiple serdes with same name: " + sendeConf.getName());
      }
      serdes.put(sendeConf.getName(), instance);
    }

    // initializing built-in serdes (if they were not initialized by config)
    BUILT_IN_SERDES.forEach((name, clazz) -> {
      if (!serdes.containsKey(name)) {
        var serde = createSerdeInstance(clazz);
        serde.configure(
            PropertyResolverImpl.empty(),
            clusterPropertiesResolver,
            globalPropertiesResolver
        );
        serdes.put(name, new SerdeInstance(serde, null, null, null));
      }
    });

    defaultKeySerde = Optional.ofNullable(clusterProp.getDefaultKeySerde())
        .map(name -> Preconditions.checkNotNull(serdes.get(name), "Default key serde not found"))
        .orElse(fallbackSerde());

    defaultValueSerde = Optional.ofNullable(clusterProp.getDefaultValueSerde())
        .map(name -> Preconditions.checkNotNull(serdes.get(name), "Default value serde not found"))
        .orElse(fallbackSerde());
  }

  @SneakyThrows
  private SerdeInstance init(ClustersProperties.SerdeConfig serdeConfig,
                             PropertyResolver serdeProps,
                             PropertyResolver clusterProps,
                             PropertyResolver globalProps) {
    String name = serdeConfig.getName();
    String className = serdeConfig.getClassName();
    if (className == null) {
      Preconditions.checkState(
          BUILT_IN_SERDES.containsKey(name),
          "You can only skip className property if this is built-in serde: " + serdeConfig
      );
      className = BUILT_IN_SERDES.get(name).getName();
    }

    Class<?> clazz = Class.forName(className);
    if (BUILT_IN_SERDES.containsValue(clazz)) {
      // this is built-in serde configuration
      Serde serde = createSerdeInstance(clazz);
      serde.configure(serdeProps, clusterProps, globalProps);
      return new SerdeInstance(
          serde,
          nullablePattern(serdeConfig.getTopicKeysPattern()),
          nullablePattern(serdeConfig.getTopicValuesPattern()),
          null
      );
    }
    return loadCustom(serdeConfig, serdeProps, clusterProps, globalProps);
  }

  @SneakyThrows
  private Serde createSerdeInstance(Class<?> clazz) {
    return (Serde) clazz.getDeclaredConstructor().newInstance();
  }

  private static SerdeInstance fallbackSerde() {
    Serde serde = new StringSerde();
    serde.configure(PropertyResolverImpl.empty(), PropertyResolverImpl.empty(), PropertyResolverImpl.empty());
    return new SerdeInstance(serde, null, null, null);
  }

  private SerdeInstance loadCustom(ClustersProperties.SerdeConfig serdeConfig,
                                   PropertyResolver serdeProps,
                                   PropertyResolver clusterProps,
                                   PropertyResolver globalProps) {
    var loaded = CUSTOM_SERDE_LOADER.loadAndConfigure(
        serdeConfig.getClassName(), serdeConfig.getLocation(), serdeProps, clusterProps, globalProps);
    return new SerdeInstance(
        loaded.getSerde(),
        nullablePattern(serdeConfig.getTopicKeysPattern()),
        nullablePattern(serdeConfig.getTopicValuesPattern()),
        loaded.getClassLoader()
    );
  }

  private Pattern nullablePattern(@Nullable String pattern) {
    return pattern == null ? null : Pattern.compile(pattern);
  }

  @Value
  private static class SerdeInstance {

    Serde serde;

    @Nullable
    Pattern topicKeyPattern;

    @Nullable
    Pattern topicValuePattern;

    @Nullable // not-null for custom serde only
    ClassLoader classLoader;
  }

}
