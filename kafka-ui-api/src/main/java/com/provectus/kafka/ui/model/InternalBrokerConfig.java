package com.provectus.kafka.ui.model;


import java.util.List;
import lombok.Builder;
import lombok.Data;
import org.apache.kafka.clients.admin.ConfigEntry;

@Data
@Builder
public class InternalBrokerConfig {
  private final String name;
  private final String value;
  private final ConfigEntry.ConfigSource source;
  private final boolean isSensitive;
  private final boolean isReadOnly;
  private final List<ConfigEntry.ConfigSynonym> synonyms;
}
