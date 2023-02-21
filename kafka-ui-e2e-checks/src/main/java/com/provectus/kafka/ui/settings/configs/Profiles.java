package com.provectus.kafka.ui.settings.configs;

import org.aeonbits.owner.Config;

import static com.provectus.kafka.ui.variables.Browser.CONTAINER;
import static com.provectus.kafka.ui.variables.Suite.CUSTOM;

public interface Profiles extends Config {

    @Key("browser")
    @DefaultValue(CONTAINER)
    String browser();

    @Key("suite")
    @DefaultValue(CUSTOM)
    String suite();
}
