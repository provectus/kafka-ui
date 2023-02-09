package com.provectus.kafka.ui.settings.configs;

import org.aeonbits.owner.Config;

import static org.apache.commons.lang3.BooleanUtils.TRUE;

public interface Profiles extends Config {

    String CONTAINER = "container";
    String LOCAL = "local";

    @Key("browser")
    @DefaultValue(CONTAINER)
    String browser();

    @Key("suite")
    @DefaultValue("custom")
    String suite();

    @Key("qase")
    @DefaultValue(TRUE)
    String qase();
}
