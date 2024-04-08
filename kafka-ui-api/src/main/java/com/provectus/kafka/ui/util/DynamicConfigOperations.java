package com.provectus.kafka.ui.util;


import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.config.WebclientProperties;
import com.provectus.kafka.ui.config.auth.OAuthProperties;
import com.provectus.kafka.ui.config.auth.RoleBasedAccessControlProperties;
import com.provectus.kafka.ui.exception.FileUploadException;
import com.provectus.kafka.ui.exception.ValidationException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
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
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.introspector.BeanAccess;
import org.yaml.snakeyaml.introspector.Property;
import org.yaml.snakeyaml.introspector.PropertyUtils;
import org.yaml.snakeyaml.nodes.NodeTuple;
import org.yaml.snakeyaml.nodes.Tag;
import org.yaml.snakeyaml.representer.Representer;
import reactor.core.publisher.Mono;

@Slf4j
@RequiredArgsConstructor
@Component
public class DynamicConfigOperations {

  static final String DYNAMIC_CONFIG_ENABLED_ENV_PROPERTY = "dynamic.config.enabled";
  static final String FILTERING_GROOVY_ENABLED_PROPERTY = "filtering.groovy.enabled";
  static final String DYNAMIC_CONFIG_PATH_ENV_PROPERTY = "dynamic.config.path";
  static final String DYNAMIC_CONFIG_PATH_ENV_PROPERTY_DEFAULT = "/etc/kafkaui/dynamic_config.yaml";

  static final String CONFIG_RELATED_UPLOADS_DIR_PROPERTY = "config.related.uploads.dir";
  static final String CONFIG_RELATED_UPLOADS_DIR_DEFAULT = "/etc/kafkaui/uploads";

  public static ApplicationContextInitializer<ConfigurableApplicationContext> dynamicConfigPropertiesInitializer() {
    return appCtx ->
        new DynamicConfigOperations(appCtx)
            .loadDynamicPropertySource()
            .ifPresent(source -> appCtx.getEnvironment().getPropertySources().addFirst(source));
  }

  private final ConfigurableApplicationContext ctx;

  public boolean dynamicConfigEnabled() {
    return "true".equalsIgnoreCase(ctx.getEnvironment().getProperty(DYNAMIC_CONFIG_ENABLED_ENV_PROPERTY));
  }

  public boolean filteringGroovyEnabled() {
    return "true".equalsIgnoreCase(ctx.getEnvironment().getProperty(FILTERING_GROOVY_ENABLED_PROPERTY));
  }

  private Path dynamicConfigFilePath() {
    return Paths.get(
        Optional.ofNullable(ctx.getEnvironment().getProperty(DYNAMIC_CONFIG_PATH_ENV_PROPERTY))
            .orElse(DYNAMIC_CONFIG_PATH_ENV_PROPERTY_DEFAULT)
    );
  }

  @SneakyThrows
  public Optional<PropertySource<?>> loadDynamicPropertySource() {
    if (dynamicConfigEnabled()) {
      Path configPath = dynamicConfigFilePath();
      if (!Files.exists(configPath) || !Files.isReadable(configPath)) {
        log.warn("Dynamic config file {} doesnt exist or not readable", configPath);
        return Optional.empty();
      }
      var propertySource = new CompositePropertySource("dynamicProperties");
      new YamlPropertySourceLoader()
          .load("dynamicProperties", new FileSystemResource(configPath))
          .forEach(propertySource::addPropertySource);
      log.info("Dynamic config loaded from {}", configPath);
      return Optional.of(propertySource);
    }
    return Optional.empty();
  }

  public PropertiesStructure getCurrentProperties() {
    checkIfDynamicConfigEnabled();
    return PropertiesStructure.builder()
        .kafka(getNullableBean(ClustersProperties.class))
        .rbac(getNullableBean(RoleBasedAccessControlProperties.class))
        .auth(
            PropertiesStructure.Auth.builder()
                .type(ctx.getEnvironment().getProperty("auth.type"))
                .oauth2(getNullableBean(OAuthProperties.class))
                .build())
        .webclient(getNullableBean(WebclientProperties.class))
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
    checkIfDynamicConfigEnabled();
    properties.initAndValidate();

    String yaml = serializeToYaml(properties);
    writeYamlToFile(yaml, dynamicConfigFilePath());
  }

  public Mono<Path> uploadConfigRelatedFile(FilePart file) {
    checkIfDynamicConfigEnabled();
    String targetDirStr = ctx.getEnvironment()
        .getProperty(CONFIG_RELATED_UPLOADS_DIR_PROPERTY, CONFIG_RELATED_UPLOADS_DIR_DEFAULT);

    Path targetDir = Path.of(targetDirStr);
    if (!Files.exists(targetDir)) {
      try {
        Files.createDirectories(targetDir);
      } catch (IOException e) {
        return Mono.error(
            new FileUploadException("Error creating directory for uploads %s".formatted(targetDir), e));
      }
    }

    Path targetFilePath = targetDir.resolve(file.filename() + "-" + Instant.now().getEpochSecond());
    log.info("Uploading config-related file {}", targetFilePath);
    if (Files.exists(targetFilePath)) {
      log.info("File {} already exists, it will be overwritten", targetFilePath);
    }

    return file.transferTo(targetFilePath)
        .thenReturn(targetFilePath)
        .doOnError(th -> log.error("Error uploading file {}", targetFilePath, th))
        .onErrorMap(th -> new FileUploadException(targetFilePath, th));
  }

  public void checkIfFilteringGroovyEnabled() {
    if (!filteringGroovyEnabled()) {
      throw new ValidationException(
              "Groovy filters is not allowed. "
                      + "Set filtering.groovy.enabled property to 'true' to enabled it.");
    }
  }

  private void checkIfDynamicConfigEnabled() {
    if (!dynamicConfigEnabled()) {
      throw new ValidationException(
          "Dynamic config change is not allowed. "
              + "Set dynamic.config.enabled property to 'true' to enabled it.");
    }
  }

  @SneakyThrows
  private void writeYamlToFile(String yaml, Path path) {
    if (Files.isDirectory(path)) {
      throw new ValidationException("Dynamic file path is a directory, but should be a file path");
    }
    if (!Files.exists(path.getParent())) {
      Files.createDirectories(path.getParent());
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
    var propertyUtils = new PropertyUtils();
    propertyUtils.setBeanAccess(BeanAccess.FIELD);
    representer.setPropertyUtils(propertyUtils);
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
    private RoleBasedAccessControlProperties rbac;
    private Auth auth;
    private WebclientProperties webclient;

    @Data
    @Builder
    public static class Auth {
      String type;
      OAuthProperties oauth2;
    }

    public void initAndValidate() {
      Optional.ofNullable(kafka)
          .ifPresent(ClustersProperties::validateAndSetDefaults);

      Optional.ofNullable(rbac)
          .ifPresent(RoleBasedAccessControlProperties::init);

      Optional.ofNullable(auth)
          .flatMap(a -> Optional.ofNullable(a.oauth2))
          .ifPresent(OAuthProperties::init);

      Optional.ofNullable(webclient)
          .ifPresent(WebclientProperties::validate);
    }
  }

}
