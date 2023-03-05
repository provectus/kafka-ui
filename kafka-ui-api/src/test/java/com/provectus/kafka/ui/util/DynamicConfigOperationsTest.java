package com.provectus.kafka.ui.util;

import static com.provectus.kafka.ui.util.DynamicConfigOperations.DYNAMIC_CONFIG_ENABLED_ENV_PROPERTY;
import static com.provectus.kafka.ui.util.DynamicConfigOperations.DYNAMIC_CONFIG_PATH_ENV_PROPERTY;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.config.ClustersProperties;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.Nullable;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.PropertySource;

class DynamicConfigOperationsTest {

  private static final String SAMPLE_YAML_CONFIG = """
       kafka:
        clusters:
          - name: test
            bootstrapServers: localhost:9092
      """;

  private final ConfigurableApplicationContext ctxMock = mock(ConfigurableApplicationContext.class);
  private final ConfigurableEnvironment envMock = mock(ConfigurableEnvironment.class);

  private final DynamicConfigOperations ops = new DynamicConfigOperations(ctxMock);

  @TempDir
  private Path tmpDir;

  @BeforeEach
  void initMocks() {
    when(ctxMock.getEnvironment()).thenReturn(envMock);
  }

  @Test
  void initializerAddsDynamicPropertySourceIfAllEnvVarsAreSet() throws Exception {
    Path propsFilePath = tmpDir.resolve("props.yaml");
    Files.writeString(propsFilePath, SAMPLE_YAML_CONFIG, StandardOpenOption.CREATE);

    MutablePropertySources propertySources = new MutablePropertySources();
    propertySources.addFirst(new MapPropertySource("test", Map.of("testK", "testV")));

    when(envMock.getPropertySources()).thenReturn(propertySources);
    mockEnvWithVars(Map.of(
        DYNAMIC_CONFIG_ENABLED_ENV_PROPERTY, "true",
        DYNAMIC_CONFIG_PATH_ENV_PROPERTY, propsFilePath.toString()
    ));

    DynamicConfigOperations.dynamicConfigPropertiesInitializer().initialize(ctxMock);

    assertThat(propertySources.size()).isEqualTo(2);
    assertThat(propertySources.stream())
        .element(0)
        .extracting(PropertySource::getName)
        .isEqualTo("dynamicProperties");
  }

  @ParameterizedTest
  @CsvSource({
      "false, /tmp/conf.yaml",
      "true, ",
      ", /tmp/conf.yaml",
      ",",
      "true, /tmp/conf.yaml", //vars set, but file doesn't exist
  })
  void initializerDoNothingIfAnyOfEnvVarsNotSet(@Nullable String enabledVar, @Nullable String pathVar) {
    var vars = new HashMap<String, Object>(); // using HashMap to keep null values
    vars.put(DYNAMIC_CONFIG_ENABLED_ENV_PROPERTY, enabledVar);
    vars.put(DYNAMIC_CONFIG_PATH_ENV_PROPERTY, pathVar);
    mockEnvWithVars(vars);

    DynamicConfigOperations.dynamicConfigPropertiesInitializer().initialize(ctxMock);
    verify(envMock, times(0)).getPropertySources();
  }

  @ParameterizedTest
  @ValueSource(booleans = {true, false})
  void persistRewritesOrCreateConfigFile(boolean exists) throws Exception {
    Path propsFilePath = tmpDir.resolve("props.yaml");
    if (exists) {
      Files.writeString(propsFilePath, SAMPLE_YAML_CONFIG, StandardOpenOption.CREATE);
    }

    mockEnvWithVars(Map.of(
        DYNAMIC_CONFIG_ENABLED_ENV_PROPERTY, "true",
        DYNAMIC_CONFIG_PATH_ENV_PROPERTY, propsFilePath.toString()
    ));

    var overrideProps = new ClustersProperties();
    var cluster = new ClustersProperties.Cluster();
    cluster.setName("newName");
    overrideProps.setClusters(List.of(cluster));

    ops.persist(
        DynamicConfigOperations.PropertiesStructure.builder()
            .kafka(overrideProps)
            .build()
    );

    assertThat(ops.loadDynamicPropertySource())
        .get()
        .extracting(ps -> ps.getProperty("kafka.clusters[0].name"))
        .isEqualTo("newName");
  }

  private void mockEnvWithVars(Map<String, Object> envVars) {
    envVars.forEach((k, v) -> when(envMock.getProperty(k)).thenReturn((String) v));
  }

}
