package com.provectus.kafka.ui.serdes;

import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.Serde;

public interface BuiltInSerde extends Serde {

  // returns true is serde has enough properties set on cluster&global levels to
  // be configured without explicit config provide
  default boolean canBeAutoConfigured(PropertyResolver kafkaClusterProperties,
                                      PropertyResolver globalProperties) {
    return true;
  }

  // will be called for build-in serdes that were not explicitly registered
  // and that returned true on canBeAutoConfigured(..) call.
  // NOTE: Serde.configure() method won't be called if serde is auto-configured!
  default void autoConfigure(PropertyResolver kafkaClusterProperties,
                             PropertyResolver globalProperties) {
  }

  @Override
  default void configure(PropertyResolver serdeProperties,
                         PropertyResolver kafkaClusterProperties,
                         PropertyResolver globalProperties) {
  }
}
