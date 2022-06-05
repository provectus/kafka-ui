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
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import lombok.SneakyThrows;
import org.springframework.core.env.Environment;

public class SerdeRegistry {

  private static final CustomSerdeLoader CUSTOM_SERDE_LOADER = new CustomSerdeLoader();

  private static final Map<String, Class<? extends BuiltInSerde>> BUILT_IN_SERDES =
      Map.of(
          "Long", LongSerde.class,
          "String", StringSerde.class,
          "SchemaRegistry", SchemaRegistrySerde.class,
          "ProtobufFile", ProtobufFileSerde.class
      );

  // using linked map to keep order of serdes added to it
  private final Map<String, SerdeInstance> serdes = Collections.synchronizedMap(new LinkedHashMap<>());

  @Nullable
  private final SerdeInstance defaultKeySerde;

  @Nullable
  private final SerdeInstance defaultValueSerde;

  public SerdeRegistry(Environment env,
                       ClustersProperties clustersProperties,
                       int clusterIndex) {
    var globalPropertiesResolver = new PropertyResolverImpl(env);
    var clusterPropertiesResolver = new PropertyResolverImpl(env, "kafka.clusters." + clusterIndex);

    // initializing built-in serdes
    BUILT_IN_SERDES.forEach((name, clazz) -> {
      var serde = createSerdeInstance(clazz);
      if (serde.initOnStartup(clusterPropertiesResolver, globalPropertiesResolver)) {
        serde.configure(
            PropertyResolverImpl.empty(),
            clusterPropertiesResolver,
            globalPropertiesResolver
        );
        serdes.put(name, new SerdeInstance(name, serde, null, null, null));
      }
    });

    // initializing serdes from config
    ClustersProperties.Cluster clusterProp = clustersProperties.getClusters().get(clusterIndex);
    if (clusterProp.getSerde() != null) {
      for (int i = 0; i < clusterProp.getSerde().size(); i++) {
        var sendeConf = clusterProp.getSerde().get(i);
        if (BUILT_IN_SERDES.containsKey(sendeConf.getName())) {
          throw new ValidationException("Custom serde's name should not mach BuiltIn serde's name");
        }
        if (serdes.containsKey(sendeConf.getName())) {
          throw new ValidationException("Multiple serdes with same name: " + sendeConf.getName());
        }
        var instance = init(
            sendeConf,
            new PropertyResolverImpl(env, "kafka.clusters." + clusterIndex + ".serde." + i),
            clusterPropertiesResolver,
            globalPropertiesResolver
        );
        serdes.put(sendeConf.getName(), instance);
      }
    }

    defaultKeySerde = Optional.ofNullable(clusterProp.getDefaultKeySerde())
        .map(name -> Preconditions.checkNotNull(serdes.get(name), "Default key serde not found"))
        // TODO: discuss this is done for configs backward-compatibility
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
  }

  @SneakyThrows
  private SerdeInstance init(ClustersProperties.SerdeConfig serdeConfig,
                             PropertyResolver serdeProps,
                             PropertyResolver clusterProps,
                             PropertyResolver globalProps) {
    String name = serdeConfig.getName();
    String className = serdeConfig.getClassName();
    Class<? extends Serde> clazz = (Class<? extends Serde>) Class.forName(className);
    // configuring one of prebuilt serdes with custom params
    if (BUILT_IN_SERDES.containsValue(clazz)) {
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
    return serdes.get("String");
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

  private Pattern nullablePattern(@Nullable String pattern) {
    return pattern == null ? null : Pattern.compile(pattern);
  }

  public Optional<SerdeInstance> findSerdeForTopic(String topic, Serde.Type type) {
    // iterating over serder in the same order they were added in config
    for (SerdeInstance serdeInstance : serdes.values()) {
      var pattern = type == Serde.Type.KEY
          ? serdeInstance.topicKeyPattern
          : serdeInstance.topicValuePattern;
      if (pattern != null
          && pattern.matcher(topic).matches()
          && serdeInstance.canSerialize(topic, type)) {
        return Optional.of(serdeInstance);
      }
    }
    if (type == Serde.Type.KEY
        && defaultKeySerde != null
        && defaultKeySerde.canSerialize(topic, type)) {
      return Optional.of(defaultKeySerde);
    }
    if (type == Serde.Type.VALUE
        && defaultValueSerde != null
        && defaultValueSerde.canSerialize(topic, type)) {
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
