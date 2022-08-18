package com.provectus.kafka.ui.extensions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.testcontainers.shaded.org.apache.commons.io.IOUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.apache.kafka.common.utils.Utils.readFileAsString;

@Slf4j
public class FileUtils {

    @Nullable
    public static String getResourceAsString(String resourceFileName) {
        try {
            return IOUtils.resourceToString("/" + resourceFileName, StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("getResourceAsString() returns null", e);
            return null;
        }
    }

    @Nullable
    public static String fileToString(String path) {
        try {
            return readFileAsString(path);
        } catch (IOException e) {
            log.error("fileToString() returns null", e);
            return null;
        }
    }
}
