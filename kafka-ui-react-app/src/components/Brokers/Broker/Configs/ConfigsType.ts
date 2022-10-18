export enum ConfigSourceTooltip {
  DYNAMIC_TOPIC_CONFIG = 'dynamic topic config that is configured for a specific topic',
  DYNAMIC_BROKER_LOGGER_CONFIG = 'dynamic broker logger config that is configured for a specific broker',
  DYNAMIC_BROKER_CONFIG = 'dynamic broker config that is configured for a specific broker',
  DYNAMIC_DEFAULT_BROKER_CONFIG = 'dynamic broker config that is configured as default for all brokers in the cluster',
  STATIC_BROKER_CONFIG = 'static broker config provided as broker properties at start up (e.g. server.properties file)',
  DEFAULT_CONFIG = 'built-in default configuration for configs that have a default value',
  UNKNOWN = 'source unknown e.g. in the ConfigEntry used for alter requests where source is not set',
}
