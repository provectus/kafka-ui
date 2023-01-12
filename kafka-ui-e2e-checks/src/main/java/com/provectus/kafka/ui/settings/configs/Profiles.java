package com.provectus.kafka.ui.settings.configs;

import org.aeonbits.owner.Config;

public interface Profiles extends Config {

  String CONTAINER = "container";
  String LOCAL = "local";

  @Key("browser")
  @DefaultValue(CONTAINER)
  String browser();
}
