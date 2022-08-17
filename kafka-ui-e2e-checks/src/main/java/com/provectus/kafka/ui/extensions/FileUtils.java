package com.provectus.kafka.ui.extensions;

import org.testcontainers.shaded.org.apache.commons.io.IOUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.apache.kafka.common.utils.Utils.readFileAsString;


public class FileUtils {

    public static String getResourceAsString(String resourceFileName) {
        try {
            return IOUtils.resourceToString("/" + resourceFileName, StandardCharsets.UTF_8);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static String fileToString(String path) {
        try {
            return readFileAsString(path);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
