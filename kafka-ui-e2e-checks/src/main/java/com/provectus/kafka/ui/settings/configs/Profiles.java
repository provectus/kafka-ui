package com.provectus.kafka.ui.settings.configs;

import org.aeonbits.owner.Config;

import static com.provectus.kafka.ui.variables.Browser.CONTAINER;

public interface Profiles extends Config {

    @Key("browser")
    @DefaultValue(CONTAINER)
    String browser();
}
