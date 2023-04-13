package com.provectus.kafka.ui.utilities;

import static org.apache.kafka.common.utils.Utils.readFileAsString;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.testcontainers.shaded.org.apache.commons.io.IOUtils;

public class FileUtils {

  public static String getResourceAsString(String resourceFileName) {
    try {
      return IOUtils.resourceToString("/" + resourceFileName, StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  public static String fileToString(String path) {
    try {
      return readFileAsString(path);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }
}
