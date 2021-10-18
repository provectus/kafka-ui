package com.provectus.kafka.ui.extensions;

import java.nio.file.Files;
import java.nio.file.Paths;

public class FileProcessor {


    public static String readFileAsString(String path)throws Exception
    {
        return new String(Files.readAllBytes(Paths.get(path)));
    }
}
