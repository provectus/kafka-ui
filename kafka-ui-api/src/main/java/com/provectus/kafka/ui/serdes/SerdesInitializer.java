package com.provectus.kafka.ui.serdes;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Preconditions;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableMap;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.config.ClustersProperties.SerdeConfig;
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
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import javax.annotation.Nullable;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;

@Slf4j
public class SerdesInitializer {

  private final Map<String, Class<? extends BuiltInSerde>> builtInSerdeClasses;
  private final CustomSerdeLoader customSerdeLoader;

  public SerdesInitializer() {
    this(
        ImmutableMap.<String, Class<? extends BuiltInSerde>>builder()
            .put(StringSerde.name(), StringSerde.class)
            .put(SchemaRegistrySerde.name(), SchemaRegistrySerde.class)
            .put(ProtobufFileSerde.name(), ProtobufFileSerde.class)
            .put(Int32Serde.name(), Int32Serde.class)
            .put(Int64Serde.name(), Int64Serde.class)
            .put(UInt32Serde.name(), UInt32Serde.class)
            .put(UInt64Serde.name(), UInt64Serde.class)
            .put(Base64Serde.name(), Base64Serde.class)
            .put(UuidBinarySerde.name(), UuidBinarySerde.class)
            .build(),
        new CustomSerdeLoader()
    );
  }

  @VisibleForTesting
  SerdesInitializer(Map<String, Class<? extends BuiltInSerde>> builtInSerdeClasses,
                    CustomSerdeLoader customSerdeLoader) {
    this.builtInSerdeClasses = builtInSerdeClasses;
    this.customSerdeLoader = customSerdeLoader;
  }

  /**
   * Initialization algorithm:
   * First, we iterate over explicitly configured serdes from cluster config:
   * > if serde has name = one of built-in serde's names:
   * - if serde's properties are empty, we treat it as serde should be
   * auto-configured - we try to do that
   * - if serde's properties not empty, we treat it as an intention to
   * override default configuration, so we configuring it with specific config (calling configure(..))
   * <p/>
   * > if serde has className = one of built-in serde's classes:
   * - initializing it with specific config and with default classloader
   * <p/>
   * > if serde has custom className != one of built-in serde's classes:
   * - initializing it with specific config and with custom classloader (see CustomSerdeLoader)
   * <p/>
   * Second, we iterate over remaining built-in serdes (that we NOT explicitly configured by config)
   * trying to auto-configure them and  registering with empty patterns - they will be present
   * in Serde selection in UI, but not assigned to any topic k/v.
   */
  public ClusterSerdes init(Environment env,
                            ClustersProperties clustersProperties,
                            int clusterIndex) {
    ClustersProperties.Cluster clusterProperties = clustersProperties.getClusters().get(clusterIndex);
    log.debug("Configuring serdes for cluster {}", clusterProperties.getName());

    var globalPropertiesResolver = new PropertyResolverImpl(env);
    var clusterPropertiesResolver = new PropertyResolverImpl(env, "kafka.clusters." + clusterIndex);

    Map<String, SerdeInstance> registeredSerdes = new LinkedHashMap<>();
    // initializing serdes from config
    for (int i = 0; i < clusterProperties.getSerde().size(); i++) {
      SerdeConfig serdeConfig = clusterProperties.getSerde().get(i);
      if (Strings.isNullOrEmpty(serdeConfig.getName())) {
        throw new ValidationException("'name' property not set for serde: " + serdeConfig);
      }
      if (registeredSerdes.containsKey(serdeConfig.getName())) {
        throw new ValidationException("Multiple serdes with same name: " + serdeConfig.getName());
      }
      var instance = createSerdeFromConfig(
          serdeConfig,
          new PropertyResolverImpl(env, "kafka.clusters." + clusterIndex + ".serde." + i + ".properties"),
          clusterPropertiesResolver,
          globalPropertiesResolver
      );
      registeredSerdes.put(serdeConfig.getName(), instance);
    }

    // initializing remaining built-in serdes with empty selection patters
    builtInSerdeClasses.forEach((name, clazz) -> {
      if (!registeredSerdes.containsKey(name)) {
        BuiltInSerde serde = createSerdeInstance(clazz);
        if (serde.canBeAutoConfigured(clusterPropertiesResolver, globalPropertiesResolver)) {
          serde.autoConfigure(clusterPropertiesResolver, globalPropertiesResolver);
          registeredSerdes.put(name, new SerdeInstance(name, serde, null, null, null));
        }
      }
    });

    return new ClusterSerdes(
        registeredSerdes,
        Optional.ofNullable(clusterProperties.getDefaultKeySerde())
            .map(name -> Preconditions.checkNotNull(registeredSerdes.get(name), "Default key serde not found"))
            .or(() -> Optional.ofNullable(registeredSerdes.get(SchemaRegistrySerde.name())))
            .or(() -> Optional.ofNullable(registeredSerdes.get(ProtobufFileSerde.name())))
            .orElse(null),
        Optional.ofNullable(clusterProperties.getDefaultValueSerde())
            .map(name -> Preconditions.checkNotNull(registeredSerdes.get(name), "Default value serde not found"))
            .or(() -> Optional.ofNullable(registeredSerdes.get(SchemaRegistrySerde.name())))
            .or(() -> Optional.ofNullable(registeredSerdes.get(ProtobufFileSerde.name())))
            .orElse(null),
        createFallbackSerde()
    );
  }

  private SerdeInstance createFallbackSerde() {
    StringSerde serde = new StringSerde();
    serde.configure(PropertyResolverImpl.empty(), PropertyResolverImpl.empty(), PropertyResolverImpl.empty());
    return new SerdeInstance("Fallback", serde, null, null, null);
  }

  @SneakyThrows
  private SerdeInstance createSerdeFromConfig(SerdeConfig serdeConfig,
                                              PropertyResolver serdeProps,
                                              PropertyResolver clusterProps,
                                              PropertyResolver globalProps) {
    if (builtInSerdeClasses.containsKey(serdeConfig.getName())) {
      return createSerdeWithBuiltInSerdeName(serdeConfig, serdeProps, clusterProps, globalProps);
    }
    if (serdeConfig.getClassName() != null) {
      var builtInSerdeClass = builtInSerdeClasses.values().stream()
          .filter(c -> c.getName().equals(serdeConfig.getClassName()))
          .findAny();
      if (builtInSerdeClass.isPresent()) {
        return createSerdeWithBuiltInClass(builtInSerdeClass.get(), serdeConfig, serdeProps, clusterProps, globalProps);
      }
    }
    log.info("Loading custom serde {}", serdeConfig.getName());
    return loadAndInitCustomSerde(serdeConfig, serdeProps, clusterProps, globalProps);
  }

  private SerdeInstance createSerdeWithBuiltInSerdeName(SerdeConfig serdeConfig,
                                                        PropertyResolver serdeProps,
                                                        PropertyResolver clusterProps,
                                                        PropertyResolver globalProps) {
    String name = serdeConfig.getName();
    if (serdeConfig.getClassName() != null) {
      throw new ValidationException("className can't be set for built-in serde");
    }
    if (serdeConfig.getFilePath() != null) {
      throw new ValidationException("filePath can't be set for built-in serde types");
    }
    var clazz = builtInSerdeClasses.get(name);
    BuiltInSerde serde = createSerdeInstance(clazz);
    if (serdeConfig.getProperties().isEmpty()) {
      if (serde.canBeAutoConfigured(clusterProps, globalProps)) {
        serde.autoConfigure(clusterProps, globalProps);
      } else {
        throw new ValidationException(name + " serde is not configured");
      }
    } else {
      serde.configure(serdeProps, clusterProps, globalProps);
    }
    return new SerdeInstance(
        name,
        serde,
        nullablePattern(serdeConfig.getTopicKeysPattern()),
        nullablePattern(serdeConfig.getTopicValuesPattern()),
        null
    );
  }

  @SneakyThrows
  private SerdeInstance createSerdeWithBuiltInClass(Class<? extends BuiltInSerde> clazz,
                                                    SerdeConfig serdeConfig,
                                                    PropertyResolver serdeProps,
                                                    PropertyResolver clusterProps,
                                                    PropertyResolver globalProps) {
    if (serdeConfig.getFilePath() != null) {
      throw new ValidationException("filePath can't be set for built-in serde type");
    }
    BuiltInSerde serde = createSerdeInstance(clazz);
    serde.configure(serdeProps, clusterProps, globalProps);
    return new SerdeInstance(
        serdeConfig.getName(),
        serde,
        nullablePattern(serdeConfig.getTopicKeysPattern()),
        nullablePattern(serdeConfig.getTopicValuesPattern()),
        null
    );
  }

  @SneakyThrows
  private <T extends Serde> T createSerdeInstance(Class<T> clazz) {
    return clazz.getDeclaredConstructor().newInstance();
  }

  private SerdeInstance loadAndInitCustomSerde(SerdeConfig serdeConfig,
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
    var loaded = customSerdeLoader.loadAndConfigure(
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
}
