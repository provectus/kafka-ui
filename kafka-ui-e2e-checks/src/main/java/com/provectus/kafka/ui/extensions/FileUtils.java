package com.provectus.kafka.ui.extensions;

import org.testcontainers.shaded.org.apache.commons.io.IOUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;


public class FileUtils {

    public static String getResourceAsString(String resourceFileName) throws IOException {
        return IOUtils.resourceToString("/" + resourceFileName, StandardCharsets.UTF_8);
    }

}
