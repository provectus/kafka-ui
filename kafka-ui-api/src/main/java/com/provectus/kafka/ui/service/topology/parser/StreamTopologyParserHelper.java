package com.provectus.kafka.ui.service.topology.parser;

import com.provectus.kafka.ui.exception.InvalidStreamTopologyString;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class StreamTopologyParserHelper {
  ParsingRes<String> parseOrThrow(String s, String after, int fromIndex, String before) {
    final int beginIndex = indexAfterStringOrThrow(s, after, fromIndex);
    final int endIndex = indexOfOrThrow(s, before, beginIndex);
    final var result = s.substring(beginIndex, endIndex).strip();
    return ParsingRes.of(result, endIndex);
  }

  ParsingRes<String> parseOrThrow(String s, String after) {
    final int beginIndex = indexAfterStringOrThrow(s, after, 0);
    final var result = s.substring(beginIndex).strip();
    return ParsingRes.of(result, s.length());
  }

  List<String> parseArrayOrThrow(String s, String after, int fromIndex, String before) {
    final int listBegin = indexAfterStringOrThrow(s, after, fromIndex);
    final int listEnd = indexOfOrThrow(s, before, listBegin);
    return getArrayResult(s, listBegin, listEnd);
  }

  List<String> parseArrayOrThrow(String s, String after) {
    final int listBegin = indexAfterStringOrThrow(s, after, 0);
    final int listEnd = s.length();
    return getArrayResult(s, listBegin, listEnd);
  }

  private List<String> getArrayResult(String s, int listBegin, int listEnd) {
    final var parsedList =
        Arrays.stream(s.substring(listBegin, listEnd).split(","))
            .filter(StringUtils::hasText)
            .map(String::strip)
            .collect(Collectors.toList());
    return parsedList;
  }

  int indexAfterStringOrThrow(String s, String str, int fromIndex) {
    final int index = indexOfOrThrow(s, str, fromIndex);
    return index + str.length();
  }

  private int indexOfOrThrow(String s, String str, int fromIndex) {
    final int index = s.indexOf(str, fromIndex);
    if (fromIndex == -1 || fromIndex >= s.length() || index == -1) {
      throw new InvalidStreamTopologyString(
          String.format("cannot find string %s in topology string", str));
    }
    return index;
  }

  static class ParsingRes<T> {
    T value;
    int endIndex;

    private ParsingRes() {
    }

    static <T> ParsingRes<T> of(T res, Integer endIndex) {
      if (endIndex == null) {
        throw new IllegalArgumentException("endIndex cannot be null");
      }
      final var parsingRes = new ParsingRes<T>();
      parsingRes.value = res;
      parsingRes.endIndex = endIndex;
      return parsingRes;
    }
  }
}
