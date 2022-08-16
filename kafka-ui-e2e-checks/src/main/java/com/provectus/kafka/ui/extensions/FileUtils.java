package com.provectus.kafka.ui.extensions;

import org.testcontainers.shaded.org.apache.commons.io.IOUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;


public class FileUtils {

    public static String getResourceAsString(String resourceFileName) {
        try {
            return IOUtils.resourceToString("/" + resourceFileName, StandardCharsets.UTF_8);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

}
