package com.provectus.kafka.ui.base;

public class TestConfiguration {
  public static boolean CLEAR_REPORTS_DIR =
      Boolean.parseBoolean(System.getProperty("CLEAR_REPORTS_DIR", "true"));
  public static String BASE_API_URL = System.getProperty("BASE_URL", "http://localhost:8080");
  public static String BASE_WEB_URL = System.getProperty("BASE_DOCKER_URL", "http://host.testcontainers.internal:8080");
  public static boolean USE_LOCAL_BROWSER =
      Boolean.parseBoolean(System.getProperty("USE_LOCAL_BROWSER", "true"));
  public static String REPORTS_FOLDER = System.getProperty("REPORTS_FOLDER", "allure-results");
  public static Boolean SCREENSHOTS =
      Boolean.parseBoolean(System.getProperty("SCREENSHOTS", "true"));
  public static Boolean SAVE_PAGE_SOURCE =
      Boolean.parseBoolean(System.getProperty("SAVE_PAGE_SOURCE", "false"));
  public static Boolean REOPEN_BROWSER_ON_FAIL =
      Boolean.parseBoolean(System.getProperty("REOPEN_BROWSER_ON_FAIL", "true"));
  public static String BROWSER = System.getProperty("BROWSER", "chrome");
  public static String BROWSER_SIZE = System.getProperty("BROWSER_SIZE", "1920x1080");
  public static Boolean ENABLE_VNC = Boolean.parseBoolean(System.getProperty("ENABLE_VNC", "true"));
  public static String IMAGE_NAME = System.getProperty("SELENIUM_DOCKER_IMAGE", "selenium/standalone-chrome");
  public static String IMAGE_TAG = System.getProperty("SELENIUM_IMAGE_TAG", "102.0");

}
