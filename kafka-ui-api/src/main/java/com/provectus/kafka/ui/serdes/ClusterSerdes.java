package com.provectus.kafka.ui.serdes;

import com.google.common.base.Preconditions;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableMap;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.serdes.builtin.Base64Serde;
import com.provectus.kafka.ui.serdes.builtin.Int32Serde;
import com.provectus.kafka.ui.serdes.builtin.Int64Serde;
import com.provectus.kafka.ui.serdes.builtin.ProtobufFileSerde;
import com.provectus.kafka.ui.serdes.builtin.StringSerde;
import com.provectus.kafka.ui.serdes.builtin.UInt32Serde;
import com.provectus.kafka.ui.serdes.builtin.UInt64Serde;
import com.provectus.kafka.ui.serdes.builtin.UuidBinarySerde;
import com.provectus.kafka.ui.serdes.builtin.sr.SchemaRegistrySerde;
import java.io.Closeable;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;

@Slf4j
public class ClusterSerdes implements Closeable {

  private static final CustomSerdeLoader CUSTOM_SERDE_LOADER = new CustomSerdeLoader();

  private static final Map<String, Class<? extends BuiltInSerde>> BUILT_IN_SERDES =
      ImmutableMap.<String, Class<? extends BuiltInSerde>>builder()
          .put(StringSerde.name(), StringSerde.class)
          .put(Int32Serde.name(), Int32Serde.class)
          .put(Int64Serde.name(), Int64Serde.class)
          .put(UInt32Serde.name(), UInt32Serde.class)
          .put(UInt64Serde.name(), UInt64Serde.class)
          .put(Base64Serde.name(), Base64Serde.class)
          .put(SchemaRegistrySerde.name(), SchemaRegistrySerde.class)
          .put(ProtobufFileSerde.name(), ProtobufFileSerde.class)
          .put(UuidBinarySerde.name(), UuidBinarySerde.class)
          .build();

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
    for (int i = 0; i < clusterProp.getSerde().size(); i++) {
      var sendeConf = clusterProp.getSerde().get(i);
      if (Strings.isNullOrEmpty(sendeConf.getName())) {
        throw new ValidationException("'name' property not set for serde: " + sendeConf);
      }
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

    // initializing built-in serdes if they haven't been already initialized
    BUILT_IN_SERDES.forEach((name, clazz) -> {
      if (!serdes.containsKey(name)) { // serde can be already initialized with custom config
        var serde = createSerdeInstance(clazz);
        if (serde.initOnStartup(clusterPropertiesResolver, globalPropertiesResolver)) {
          serde.configure(
              PropertyResolverImpl.empty(),
              clusterPropertiesResolver,
              globalPropertiesResolver
          );
          serdes.put(name, new SerdeInstance(name, serde, null, null, null));
        }
      }
    });

    defaultKeySerde = Optional.ofNullable(clusterProp.getDefaultKeySerde())
        .map(name -> Preconditions.checkNotNull(serdes.get(name), "Default key serde not found"))
        .or(() -> Optional.ofNullable(serdes.get(SchemaRegistrySerde.name())))
        .or(() -> Optional.ofNullable(serdes.get(ProtobufFileSerde.name())))
        .orElse(null);

    defaultValueSerde = Optional.ofNullable(clusterProp.getDefaultValueSerde())
        .map(name -> Preconditions.checkNotNull(serdes.get(name), "Default value serde not found"))
        .or(() -> Optional.ofNullable(serdes.get(SchemaRegistrySerde.name())))
        .or(() -> Optional.ofNullable(serdes.get(ProtobufFileSerde.name())))
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
      if (serdeConfig.getFilePath() != null) {
        throw new ValidationException("filePath can't be set for built-in serde");
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
    log.info("Loading custom serde {}", serdeConfig.getName());
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
    if (Strings.isNullOrEmpty(serdeConfig.getClassName())) {
      throw new ValidationException(
          "'className' property not set for custom serde " + serdeConfig.getName());
    }
    if (Strings.isNullOrEmpty(serdeConfig.getFilePath())) {
      throw new ValidationException(
          "'filePath' property not set for custom serde " + serdeConfig.getName());
    }
    var loaded = CUSTOM_SERDE_LOADER.loadAndConfigure(
        serdeConfig.getClassName(), serdeConfig.getFilePath(), serdeProps, clusterProps, globalProps);
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
