package com.provectus.kafka.ui.util;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.Resource;
import org.springframework.util.FileCopyUtils;

public class ResourceUtil {

  private ResourceUtil() {
  }

  public static String readAsString(Resource resource) throws IOException {
    try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)) {
      return FileCopyUtils.copyToString(reader);
    }
  }
}
