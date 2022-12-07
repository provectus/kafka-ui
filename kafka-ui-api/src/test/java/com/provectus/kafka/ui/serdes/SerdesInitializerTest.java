package com.provectus.kafka.ui.serdes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serdes.builtin.Int32Serde;
import com.provectus.kafka.ui.serdes.builtin.StringSerde;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;
import org.springframework.mock.env.MockEnvironment;

class SerdesInitializerTest {

  private final Environment env = new MockEnvironment();
  private final CustomSerdeLoader customSerdeLoaderMock = mock(CustomSerdeLoader.class);

  private final SerdesInitializer initializer = new SerdesInitializer(
      Map.of(
          "BuiltIn1", BuiltInSerdeWithAutoconfigure.class,
          "BuiltIn2", BuiltInSerdeMock2NoAutoConfigure.class,
          Int32Serde.name(), Int32Serde.class,
          StringSerde.name(), StringSerde.class
      ),
      customSerdeLoaderMock
  );

  @Test
  void pluggedSerdesInitializedByLoader() {
    ClustersProperties.SerdeConfig customSerdeConfig = new ClustersProperties.SerdeConfig();
    customSerdeConfig.setName("MyPluggedSerde");
    customSerdeConfig.setFilePath("/custom.jar");
    customSerdeConfig.setClassName("org.test.MyPluggedSerde");
    customSerdeConfig.setTopicKeysPattern("keys");
    customSerdeConfig.setTopicValuesPattern("values");

    when(customSerdeLoaderMock.loadAndConfigure(anyString(), anyString(), any(), any(), any()))
        .thenReturn(new CustomSerdeLoader.CustomSerde(new StringSerde(), new URLClassLoader(new URL[]{})));

    var serdes = init(customSerdeConfig);

    SerdeInstance customSerdeInstance = serdes.serdes.get("MyPluggedSerde");
    verifyPatternsMatch(customSerdeConfig, customSerdeInstance);
    assertThat(customSerdeInstance.classLoader).isNotNull();

    verify(customSerdeLoaderMock).loadAndConfigure(
        eq(customSerdeConfig.getClassName()),
        eq(customSerdeConfig.getFilePath()),
        any(), any(), any()
    );
  }

  @Test
  void serdeWithBuiltInNameAndNoPropertiesCantBeInitializedIfSerdeNotSupportAutoConfigure() {
    ClustersProperties.SerdeConfig serdeConfig = new ClustersProperties.SerdeConfig();
    serdeConfig.setName("BuiltIn2"); //auto-configuration not supported
    serdeConfig.setTopicKeysPattern("keys");
    serdeConfig.setTopicValuesPattern("vals");

    assertThatCode(() -> initializer.init(env, createProperties(serdeConfig), 0))
        .isInstanceOf(ValidationException.class);
  }

  @Test
  void serdeWithBuiltInNameAndNoPropertiesIsAutoConfiguredIfPossible() {
    ClustersProperties.SerdeConfig serdeConfig = new ClustersProperties.SerdeConfig();
    serdeConfig.setName("BuiltIn1"); // supports auto-configuration
    serdeConfig.setTopicKeysPattern("keys");
    serdeConfig.setTopicValuesPattern("vals");

    var serdes = init(serdeConfig);

    SerdeInstance autoConfiguredSerde = serdes.serdes.get("BuiltIn1");
    verifyAutoConfigured(autoConfiguredSerde);
    verifyPatternsMatch(serdeConfig, autoConfiguredSerde);
  }

  @Test
  void serdeWithBuiltInNameAndSetPropertiesAreExplicitlyConfigured() {
    ClustersProperties.SerdeConfig serdeConfig = new ClustersProperties.SerdeConfig();
    serdeConfig.setName("BuiltIn1");
    serdeConfig.setProperties(Map.of("any", "property"));
    serdeConfig.setTopicKeysPattern("keys");
    serdeConfig.setTopicValuesPattern("vals");

    var serdes = init(serdeConfig);

    SerdeInstance explicitlyConfiguredSerde = serdes.serdes.get("BuiltIn1");
    verifyExplicitlyConfigured(explicitlyConfiguredSerde);
    verifyPatternsMatch(serdeConfig, explicitlyConfiguredSerde);
  }

  @Test
  void serdeWithCustomNameAndBuiltInClassnameAreExplicitlyConfigured() {
    ClustersProperties.SerdeConfig serdeConfig = new ClustersProperties.SerdeConfig();
    serdeConfig.setName("SomeSerde");
    serdeConfig.setClassName(BuiltInSerdeWithAutoconfigure.class.getName());
    serdeConfig.setTopicKeysPattern("keys");
    serdeConfig.setTopicValuesPattern("vals");

    var serdes = init(serdeConfig);

    SerdeInstance explicitlyConfiguredSerde = serdes.serdes.get("SomeSerde");
    verifyExplicitlyConfigured(explicitlyConfiguredSerde);
    verifyPatternsMatch(serdeConfig, explicitlyConfiguredSerde);
  }

  private ClusterSerdes init(ClustersProperties.SerdeConfig... serdeConfigs) {
    return initializer.init(env, createProperties(serdeConfigs), 0);
  }

  private ClustersProperties createProperties(ClustersProperties.SerdeConfig... serdeConfigs) {
    ClustersProperties.Cluster cluster = new ClustersProperties.Cluster();
    cluster.setName("test");
    cluster.setSerde(List.of(serdeConfigs));

    ClustersProperties clustersProperties = new ClustersProperties();
    clustersProperties.setClusters(List.of(cluster));
    return clustersProperties;
  }

  private void verifyExplicitlyConfigured(SerdeInstance serde) {
    assertThat(((BuiltInSerdeWithAutoconfigure) serde.serde).autoConfigureCheckCalled).isFalse();
    assertThat(((BuiltInSerdeWithAutoconfigure) serde.serde).autoConfigured).isFalse();
    assertThat(((BuiltInSerdeWithAutoconfigure) serde.serde).explicitlyConfigured).isTrue();
  }

  private void verifyAutoConfigured(SerdeInstance serde) {
    assertThat(((BuiltInSerdeWithAutoconfigure) serde.serde).autoConfigureCheckCalled).isTrue();
    assertThat(((BuiltInSerdeWithAutoconfigure) serde.serde).autoConfigured).isTrue();
    assertThat(((BuiltInSerdeWithAutoconfigure) serde.serde).explicitlyConfigured).isFalse();
  }

  private void verifyPatternsMatch(ClustersProperties.SerdeConfig config, SerdeInstance serde) {
    assertThat(serde.topicKeyPattern.pattern()).isEqualTo(config.getTopicKeysPattern());
    assertThat(serde.topicValuePattern.pattern()).isEqualTo(config.getTopicValuesPattern());
  }

  static class BuiltInSerdeWithAutoconfigure extends StringSerde {

    boolean explicitlyConfigured = false;
    boolean autoConfigured = false;
    boolean autoConfigureCheckCalled = false;

    @Override
    public boolean canBeAutoConfigured(PropertyResolver kafkaClusterProperties, PropertyResolver globalProperties) {
      this.autoConfigureCheckCalled = true;
      return true;
    }

    @Override
    public void autoConfigure(PropertyResolver kafkaClusterProperties, PropertyResolver globalProperties) {
      this.autoConfigured = true;
    }

    @Override
    public void configure(PropertyResolver serdeProperties,
                          PropertyResolver kafkaClusterProperties,
                          PropertyResolver globalProperties) {
      this.explicitlyConfigured = true;
    }
  }

  static class BuiltInSerdeMock2NoAutoConfigure extends BuiltInSerdeWithAutoconfigure {
    @Override
    public boolean canBeAutoConfigured(PropertyResolver kafkaClusterProperties, PropertyResolver globalProperties) {
      this.autoConfigureCheckCalled = true;
      return false;
    }
  }
}
