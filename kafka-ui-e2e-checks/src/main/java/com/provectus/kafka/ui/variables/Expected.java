package com.provectus.kafka.ui.variables;

public interface Expected {

  String BROKER_SOURCE_INFO_TOOLTIP =
      "DYNAMIC_TOPIC_CONFIG = dynamic topic config that is configured for a specific topic\n"
          + "DYNAMIC_BROKER_LOGGER_CONFIG = dynamic broker logger config that is configured for a specific broker\n"
          + "DYNAMIC_BROKER_CONFIG = dynamic broker config that is configured for a specific broker\n"
          + "DYNAMIC_DEFAULT_BROKER_CONFIG = dynamic broker config that is configured as default "
          + "for all brokers in the cluster\n"
          + "STATIC_BROKER_CONFIG = static broker config provided as broker properties at start up "
          + "(e.g. server.properties file)\n"
          + "DEFAULT_CONFIG = built-in default configuration for configs that have a default value\n"
          + "UNKNOWN = source unknown e.g. in the ConfigEntry used for alter requests where source is not set";
}
