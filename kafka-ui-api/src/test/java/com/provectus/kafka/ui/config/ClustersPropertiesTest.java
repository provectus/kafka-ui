package com.provectus.kafka.ui.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Collections;
import org.junit.jupiter.api.Test;

class ClustersPropertiesTest {

  @Test
  void clusterNamesShouldBeUniq() {
    ClustersProperties properties = new ClustersProperties();
    var c1 = new ClustersProperties.Cluster();
    c1.setName("test");
    var c2 = new ClustersProperties.Cluster();
    c2.setName("test"); //same name

    Collections.addAll(properties.getClusters(), c1, c2);

    assertThatThrownBy(properties::validateAndSetDefaults)
        .hasMessageContaining("Application config isn't valid");
  }

  @Test
  void clusterNamesShouldSetIfMultipleClustersProvided() {
    ClustersProperties properties = new ClustersProperties();
    var c1 = new ClustersProperties.Cluster();
    c1.setName("test1");
    var c2 = new ClustersProperties.Cluster(); //name not set

    Collections.addAll(properties.getClusters(), c1, c2);

    assertThatThrownBy(properties::validateAndSetDefaults)
        .hasMessageContaining("Application config isn't valid");
  }

  @Test
  void ifOnlyOneClusterProvidedNameIsOptionalAndSetToDefault() {
    ClustersProperties properties = new ClustersProperties();
    properties.getClusters().add(new ClustersProperties.Cluster());

    properties.validateAndSetDefaults();

    assertThat(properties.getClusters())
        .element(0)
        .extracting("name")
        .isEqualTo("Default");
  }

}
