package com.provectus.kafka.ui.settings.configs;

import static com.provectus.kafka.ui.variables.Browser.CONTAINER;
import static com.provectus.kafka.ui.variables.Suite.CUSTOM;

import org.aeonbits.owner.Config;

public interface Profiles extends Config {

  @Key("browser")
  @DefaultValue(CONTAINER)
  String browser();

  @Key("suite")
  @DefaultValue(CUSTOM)
  String suite();
}
