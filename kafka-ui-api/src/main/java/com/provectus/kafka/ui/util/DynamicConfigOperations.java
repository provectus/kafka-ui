package com.provectus.kafka.ui.util;


import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.config.auth.OAuthProperties;
import com.provectus.kafka.ui.exception.ValidationException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Optional;
import javax.annotation.Nullable;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.CompositePropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.introspector.Property;
import org.yaml.snakeyaml.nodes.NodeTuple;
import org.yaml.snakeyaml.nodes.Tag;
import org.yaml.snakeyaml.representer.Representer;

@Slf4j
@RequiredArgsConstructor
@Component
public class DynamicConfigOperations {

  private static final String DYNAMIC_CONFIG_ENABLED_ENV_PROPERTY = "DYNAMIC_CONFIG_ENABLED";
  private static final String DYNAMIC_CONFIG_PATH_ENV_PROPERTY = "DYNAMIC_CONFIG_PATH";

  public static ApplicationContextInitializer<ConfigurableApplicationContext> dynamicConfigPropertiesInitializer() {
    return appCtx ->
        new DynamicConfigOperations(appCtx)
            .loadDynamicPropertySource()
            .ifPresent(source -> appCtx.getEnvironment().getPropertySources().addFirst(source));
  }

  private final ConfigurableApplicationContext ctx;

  private boolean dynamicConfigEnabled() {
    var env = ctx.getEnvironment().getSystemEnvironment();
    return "true".equalsIgnoreCase((String) env.get(DYNAMIC_CONFIG_ENABLED_ENV_PROPERTY))
        && env.containsKey(DYNAMIC_CONFIG_PATH_ENV_PROPERTY);
  }

  private Path dynamicConfigFilePath() {
    var env = ctx.getEnvironment().getSystemEnvironment();
    return Paths.get((String) env.get(DYNAMIC_CONFIG_PATH_ENV_PROPERTY));
  }

  @SneakyThrows
  public Optional<PropertySource<?>> loadDynamicPropertySource() {
    if (dynamicConfigEnabled() && Files.exists(dynamicConfigFilePath())) {
      var propertySource = new CompositePropertySource("dynamicProperties");
      new YamlPropertySourceLoader()
          .load("dynamicProperties", new FileSystemResource(dynamicConfigFilePath()))
          .forEach(propertySource::addPropertySource);
      return Optional.of(propertySource);
    }
    return Optional.empty();
  }

  public PropertiesStructure getCurrentProperties() {
    return PropertiesStructure.builder()
        .kafka(getNullableBean(ClustersProperties.class))
        .build();
  }

  @Nullable
  private <T> T getNullableBean(Class<T> clazz) {
    try {
      return ctx.getBean(clazz);
    } catch (NoSuchBeanDefinitionException nsbde) {
      return null;
    }
  }

  public void persist(PropertiesStructure properties) {
    if (!dynamicConfigEnabled()) {
      throw new ValidationException(
          "Dynamic config change is not allowed. "
              + "Set DYNAMIC_CONFIG_ENABLED_ENV_PROPERTY, DYNAMIC_CONFIG_PATH environment variables to enabled it.");
    }
    properties.initAndValidate();

    String yaml = serializeToYaml(properties);
    writeYamlToFile(yaml, dynamicConfigFilePath());
  }

  private void writeYamlToFile(String yaml, Path path) {
    if (Files.isDirectory(path)) {
      throw new ValidationException("Dynamic file path is a directory, but should be a file path");
    }
    if (Files.exists(path) && !Files.isWritable(path)) {
      throw new ValidationException("File already exists and is not writable");
    }
    try {
      Files.writeString(
          path,
          yaml,
          StandardOpenOption.CREATE,
          StandardOpenOption.WRITE,
          StandardOpenOption.TRUNCATE_EXISTING // to override existing file
      );
    } catch (IOException e) {
      throw new ValidationException("Error writing to " + path, e);
    }
  }

  private String serializeToYaml(PropertiesStructure props) {
    //representer, that skips fields with null values
    Representer representer = new Representer(new DumperOptions()) {
      @Override
      protected NodeTuple representJavaBeanProperty(Object javaBean,
                                                    Property property,
                                                    Object propertyValue,
                                                    Tag customTag) {
        if (propertyValue == null) {
          return null; // if value of property is null, ignore it.
        } else {
          return super.representJavaBeanProperty(javaBean, property, propertyValue, customTag);
        }
      }
    };
    representer.addClassTag(PropertiesStructure.class, Tag.MAP); //to avoid adding class tag
    representer.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK); //use indent instead of {}
    return new Yaml(representer).dump(props);
  }

  ///---------------------------------------------------------------------

  @Data
  @Builder
  // field name should be in sync with @ConfigurationProperties annotation
  public static class PropertiesStructure {

    private ClustersProperties kafka;
    // TODO: private RoleBasedAccessControlProperties rbac;
    // TODO: private OAuthProperties auth;

    void initAndValidate() {
      Optional.ofNullable(kafka)
          .ifPresent(ClustersProperties::validateAndSetDefaults);
    }
  }

}
