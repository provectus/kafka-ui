package com.provectus.kafka.ui.newserde.builtin;

import com.provectus.kafka.ui.newserde.spi.PropertyResolver;
import com.provectus.kafka.ui.newserde.spi.Serde;

public interface BuiltInSerde extends Serde {

  default boolean initOnStartup(PropertyResolver kafkaClusterProperties,
                                PropertyResolver globalProperties) {
    return true;
  }
}
