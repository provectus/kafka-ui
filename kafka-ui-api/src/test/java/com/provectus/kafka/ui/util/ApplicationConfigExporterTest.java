package com.provectus.kafka.ui.util;

import static com.provectus.kafka.ui.util.ApplicationConfigExporter.*;

import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.config.ClustersProperties;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.context.properties.source.ConfigurationPropertySource;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.core.env.SystemEnvironmentPropertySource;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;

class ApplicationConfigExporterTest {

  private final ConfigurableEnvironment environment = Mockito.mock(ConfigurableEnvironment.class);
  private final MutablePropertySources propertySources = new MutablePropertySources();

  @BeforeEach
  void initMocks() {
    Mockito.when(environment.getPropertySources()).thenReturn(propertySources);
  }

  @Test
  void test() {
    setSystemProps(
        mapOf(
            "kafka.clusters[0].name", "testCluster1",
            "kafka.clusters[0].properties.max.wait.ts", 23432,
            "kafka.clusters[0].schemaregistry", "srHere"
        )
    );
    setEnv(
        mapOf(
            "KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS", "localhost:9092",
            "kafka.clusters.0.properties.max.Waittt.ts", 4444
            //"KAFKA_CLUSTERS_0_SCHEMA_REGISTRY", "localhost4343"//,
            //   "kafka.clusters.0.surname", "sdfsdf"
        )
    );
    System.out.println(exportAsYaml(environment));

    Binder b = new Binder(
        ConfigurationPropertySource.from(
            propertySources.get(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME)),
        ConfigurationPropertySource.from(
            propertySources.get(StandardEnvironment.SYSTEM_PROPERTIES_PROPERTY_SOURCE_NAME)
        )
    );
    var cluster = b.bind("kafka.clusters[0]", ClustersProperties.Cluster.class).get();

    var o = new DumperOptions();
    o.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
    System.out.println(new Yaml(o).dump(cluster));
  }

  private void setSystemProps(Map<String, Object> systemProps) {
    propertySources.addLast(
        new SystemEnvironmentPropertySource(
            StandardEnvironment.SYSTEM_PROPERTIES_PROPERTY_SOURCE_NAME,
            systemProps
        )
    );
  }

  private void setEnv(Map<String, Object> envProps) {
    propertySources.addLast(
        new SystemEnvironmentPropertySource(
            StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME,
            envProps
        )
    );
  }

  private void setMapProps(Map<String, Object> props) {
    propertySources.addLast(new MapPropertySource("mapPropertySource", props));
  }

  private LinkedHashMap<String, Object> mapOf(Object... objects) {
    Preconditions.checkArgument(objects.length % 2 == 0);
    var map = new LinkedHashMap<String, Object>();
    for (int i = 0; i < objects.length; i += 2) {
      map.put((String) objects[i], objects[i + 1]);
    }
    return map;
  }

}
