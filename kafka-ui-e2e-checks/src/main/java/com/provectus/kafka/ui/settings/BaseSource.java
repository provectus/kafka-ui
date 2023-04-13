package com.provectus.kafka.ui.settings;

import static com.provectus.kafka.ui.variables.Browser.LOCAL;

import com.provectus.kafka.ui.settings.configs.Config;
import org.aeonbits.owner.ConfigFactory;

public abstract class BaseSource {

  public static final String CLUSTER_NAME = "local";
  public static final String CONNECT_NAME = "first";
  private static final String LOCAL_HOST = "localhost";
  public static final String REMOTE_URL = String.format("http://%s:4444/wd/hub", LOCAL_HOST);
  public static final String BASE_API_URL = String.format("http://%s:8080", LOCAL_HOST);
  private static Config config;
  public static final String BROWSER = config().browser();
  public static final String BASE_HOST = BROWSER.equals(LOCAL)
      ? LOCAL_HOST
      : "host.docker.internal";
  public static final String BASE_UI_URL = String.format("http://%s:8080", BASE_HOST);
  public static final String SUITE_NAME = config().suite();

  private static Config config() {
    if (config == null) {
      config = ConfigFactory.create(Config.class, System.getProperties());
    }
    return config;
  }
}
