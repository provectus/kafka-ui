package com.provectus.kafka.ui.settings;

import com.provectus.kafka.ui.settings.configs.Config;
import org.aeonbits.owner.ConfigFactory;

public abstract class BaseSource {

    public static final String BASE_CONTAINER_URL = "http://host.testcontainers.internal:8080";
    public static final String BASE_LOCAL_URL = "http://localhost:8080";
    public static final String CLUSTER_NAME = "local";
    public static final String CONNECT_NAME = "first";
    private static Config config;
    public static final String BROWSER = config().browser();
    public static final String SUITE_NAME = config().suite();

    private static Config config() {
        if (config == null) {
            config = ConfigFactory.create(Config.class, System.getProperties());
        }
        return config;
    }
}
