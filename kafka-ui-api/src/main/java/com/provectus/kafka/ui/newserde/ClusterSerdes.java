package com.provectus.kafka.ui.newserde;

import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.newserde.builtin.BuiltInSerde;
import com.provectus.kafka.ui.newserde.builtin.LongSerde;
import com.provectus.kafka.ui.newserde.builtin.ProtobufFileSerde;
import com.provectus.kafka.ui.newserde.builtin.StringSerde;
import com.provectus.kafka.ui.newserde.builtin.sr.SchemaRegistrySerde;
import com.provectus.kafka.ui.newserde.spi.PropertyResolver;
import com.provectus.kafka.ui.newserde.spi.Serde;

import javax.annotation.Nullable;
import java.util.*;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import lombok.SneakyThrows;
import org.springframework.core.env.Environment;

public class ClusterSerdes {

  private static final CustomSerdeLoader CUSTOM_SERDE_LOADER = new CustomSerdeLoader();

  private static final Map<String, Class<? extends BuiltInSerde>> BUILT_IN_SERDES =
      Map.of(
          "Long", LongSerde.class,
          "String", StringSerde.class,
          "SchemaRegistry", SchemaRegistrySerde.class,
          "ProtobufFile", ProtobufFileSerde.class
      );

  // using linked map to keep order of serdes added to it
  private final Map<String, SerdeInstance> serdes = new LinkedHashMap<>();

  @Nullable
  private final SerdeInstance defaultKeySerde;

  @Nullable
  private final SerdeInstance defaultValueSerde;

  private final SerdeInstance fallbackSerde;

  public ClusterSerdes(Environment env,
                       ClustersProperties clustersProperties,
                       int clusterIndex) {
    var globalPropertiesResolver = new PropertyResolverImpl(env);
    var clusterPropertiesResolver = new PropertyResolverImpl(env, "kafka.clusters." + clusterIndex);

    // initializing serdes from config
    ClustersProperties.Cluster clusterProp = clustersProperties.getClusters().get(clusterIndex);
    if (clusterProp.getSerde() != null) {
      for (int i = 0; i < clusterProp.getSerde().size(); i++) {
        var sendeConf = clusterProp.getSerde().get(i);
        if (serdes.containsKey(sendeConf.getName())) {
          throw new ValidationException("Multiple serdes with same name: " + sendeConf.getName());
        }
        var instance = initSerdeFromConfig(
            sendeConf,
            new PropertyResolverImpl(env, "kafka.clusters." + clusterIndex + ".serde." + i + ".properties"),
            clusterPropertiesResolver,
            globalPropertiesResolver
        );
        serdes.put(sendeConf.getName(), instance);
      }
    }

    // initializing built-in serdes if they haven't been already initialized
    BUILT_IN_SERDES.forEach((name, clazz) -> {
      var serde = createSerdeInstance(clazz);
      if (!serdes.containsKey(name) // serde can be already initialized with custom config
          && serde.initOnStartup(clusterPropertiesResolver, globalPropertiesResolver)) {
        serde.configure(
            PropertyResolverImpl.empty(),
            clusterPropertiesResolver,
            globalPropertiesResolver
        );
        serdes.put(name, new SerdeInstance(name, serde, null, null, null));
      }
    });

    defaultKeySerde = Optional.ofNullable(clusterProp.getDefaultKeySerde())
        .map(name -> Preconditions.checkNotNull(serdes.get(name), "Default key serde not found"))
        // TODO: discuss: this is done for configs backward-compatibility
        // but current SR, Protobuf serde impls not fill well for this
        .or(() -> Optional.ofNullable(serdes.get("ProtobufFile")))
        .or(() -> Optional.ofNullable(serdes.get("SchemaRegistry")))
        .orElse(null);

    defaultValueSerde = Optional.ofNullable(clusterProp.getDefaultValueSerde())
        .map(name -> Preconditions.checkNotNull(serdes.get(name), "Default value serde not found"))
        // TODO: discuss this is done for configs backward-compatibility
        // but current SR, Protobuf serde impls not fill well for this
        .or(() -> Optional.ofNullable(serdes.get("ProtobufFile")))
        .or(() -> Optional.ofNullable(serdes.get("SchemaRegistry")))
        .orElse(null);

    fallbackSerde = createFallbackSerde();
  }

  private SerdeInstance createFallbackSerde() {
    StringSerde serde = new StringSerde();
    serde.configure(PropertyResolverImpl.empty(), PropertyResolverImpl.empty(), PropertyResolverImpl.empty());
    return new SerdeInstance("Fallback", serde, null, null, null);
  }

  @SneakyThrows
  private SerdeInstance initSerdeFromConfig(ClustersProperties.SerdeConfig serdeConfig,
                                            PropertyResolver serdeProps,
                                            PropertyResolver clusterProps,
                                            PropertyResolver globalProps) {
    String name = serdeConfig.getName();
    // configuring one of prebuilt serdes with custom params
    if (BUILT_IN_SERDES.containsKey(name)) {
      if (serdeConfig.getClassName() != null) {
        throw new ValidationException("className can't be set for built-in serde");
      }
      if (serdeConfig.getLocation() != null) {
        throw new ValidationException("location can't be set for built-in serde");
      }
      var clazz = BUILT_IN_SERDES.get(name);
      Serde serde = createSerdeInstance(clazz);
      serde.configure(serdeProps, clusterProps, globalProps);
      return new SerdeInstance(
          name,
          serde,
          nullablePattern(serdeConfig.getTopicKeysPattern()),
          nullablePattern(serdeConfig.getTopicValuesPattern()),
          null
      );
    }
    return loadCustom(serdeConfig, serdeProps, clusterProps, globalProps);
  }

  @SneakyThrows
  private <T extends Serde> T createSerdeInstance(Class<T> clazz) {
    return clazz.getDeclaredConstructor().newInstance();
  }

  public SerdeInstance getFallbackSerde() {
    return fallbackSerde;
  }

  private SerdeInstance loadCustom(ClustersProperties.SerdeConfig serdeConfig,
                                   PropertyResolver serdeProps,
                                   PropertyResolver clusterProps,
                                   PropertyResolver globalProps) {
    var loaded = CUSTOM_SERDE_LOADER.loadAndConfigure(
        serdeConfig.getClassName(), serdeConfig.getLocation(), serdeProps, clusterProps, globalProps);
    return new SerdeInstance(
        serdeConfig.getName(),
        loaded.getSerde(),
        nullablePattern(serdeConfig.getTopicKeysPattern()),
        nullablePattern(serdeConfig.getTopicValuesPattern()),
        loaded.getClassLoader()
    );
  }

  @Nullable
  private Pattern nullablePattern(@Nullable String pattern) {
    return pattern == null ? null : Pattern.compile(pattern);
  }

  // canSerialize()/canDeserialize() checks not applied
  public Optional<SerdeInstance> findSerdeFor(String topic, Serde.Type type) {
    return findSerdeByPatternsOrDefault(topic, type, s -> true);
  }

  // searchs by pattern and applies canDeserialize() check
  public Optional<SerdeInstance> findSerdeForDeserialize(String topic, Serde.Type type) {
    return findSerdeByPatternsOrDefault(topic, type, s -> s.canDeserialize(topic, type));
  }

  private Optional<SerdeInstance> findSerdeByPatternsOrDefault(String topic,
                                                               Serde.Type type,
                                                               Predicate<SerdeInstance> additionalCheck) {
    // iterating over serdes in the same order they were added in config
    for (SerdeInstance serdeInstance : serdes.values()) {
      var pattern = type == Serde.Type.KEY
          ? serdeInstance.topicKeyPattern
          : serdeInstance.topicValuePattern;
      if (pattern != null
          && pattern.matcher(topic).matches()
          && additionalCheck.test(serdeInstance)) {
        return Optional.of(serdeInstance);
      }
    }
    if (type == Serde.Type.KEY
        && defaultKeySerde != null
        && additionalCheck.test(defaultKeySerde)) {
      return Optional.of(defaultKeySerde);
    }
    if (type == Serde.Type.VALUE
        && defaultValueSerde != null
        && additionalCheck.test(defaultValueSerde)) {
      return Optional.of(defaultValueSerde);
    }
    return Optional.empty();
  }

  public Optional<SerdeInstance> serdeForName(String name) {
    return Optional.ofNullable(serdes.get(name));
  }

  public List<SerdeInstance> asList() {
    return serdes.values().stream().collect(Collectors.toList());
  }

}
