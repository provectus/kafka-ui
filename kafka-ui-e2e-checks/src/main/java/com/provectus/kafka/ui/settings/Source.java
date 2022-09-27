package com.provectus.kafka.ui.settings;

public abstract class Source {

  public static String BASE_API_URL = System.getProperty("BASE_URL", "http://localhost:8080");
  public static String BASE_WEB_URL = System.getProperty("BASE_DOCKER_URL", "http://host.testcontainers.internal:8080");
}
