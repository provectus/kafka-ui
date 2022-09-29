package com.provectus.kafka.ui.serdes;

import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.Serde;

public interface BuiltInSerde extends Serde {

  default boolean initOnStartup(PropertyResolver kafkaClusterProperties,
                                PropertyResolver globalProperties) {
    return true;
  }
}
