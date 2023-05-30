package com.provectus.kafka.ui.utilities;

import java.util.stream.IntStream;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class StringUtils {

  public static String getMixedCase(String original) {
    return IntStream.range(0, original.length())
        .mapToObj(i -> i % 2 == 0 ? Character.toUpperCase(original.charAt(i)) : original.charAt(i))
        .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
        .toString();
  }
}
