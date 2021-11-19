package com.provectus.kafka.ui.model;

import static com.provectus.kafka.ui.util.KafkaConstants.TOPIC_DEFAULT_CONFIGS;
import static org.apache.kafka.common.config.TopicConfig.MESSAGE_FORMAT_VERSION_CONFIG;

import java.util.List;
import lombok.Builder;
import lombok.Data;
import org.apache.kafka.clients.admin.ConfigEntry;


@Data
@Builder
public class InternalTopicConfig {
  private final String name;
  private final String value;
  private final String defaultValue;
  private final ConfigEntry.ConfigSource source;
  private final boolean isSensitive;
  private final boolean isReadOnly;
  private final List<ConfigEntry.ConfigSynonym> synonyms;

  public static InternalTopicConfig from(ConfigEntry configEntry) {
    InternalTopicConfig.InternalTopicConfigBuilder builder = InternalTopicConfig.builder()
        .name(configEntry.name())
        .value(configEntry.value())
        .source(configEntry.source())
        .isReadOnly(configEntry.isReadOnly())
        .isSensitive(configEntry.isSensitive())
        .synonyms(configEntry.synonyms());
    if (configEntry.name().equals(MESSAGE_FORMAT_VERSION_CONFIG)) {
      builder.defaultValue(configEntry.value());
    } else {
      builder.defaultValue(TOPIC_DEFAULT_CONFIGS.get(configEntry.name()));
    }
    return builder.build();
  }
}
