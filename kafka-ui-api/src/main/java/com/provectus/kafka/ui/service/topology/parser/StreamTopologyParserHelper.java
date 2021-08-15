package com.provectus.kafka.ui.service.topology.parser;

import com.provectus.kafka.ui.exception.InvalidStreamTopologyString;
import com.provectus.kafka.ui.model.GraphNode;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class StreamTopologyParserHelper {
  ParsingRes<String> parseOrThrow(String topologyString, String after, int fromIndex,
                                  String before) {
    final int beginIndex = indexAfterStringOrThrow(topologyString, after, fromIndex);
    final int endIndex = indexOfOrThrow(topologyString, before, beginIndex);
    final var result = topologyString.substring(beginIndex, endIndex).strip();
    return ParsingRes.of(result, endIndex);
  }

  ParsingRes<List<String>> parseArrayOrThrow(String topologyString, String after,
                                             int fromIndex,
                                             String before) {
    final int listBegin = indexAfterStringOrThrow(topologyString, after, fromIndex);
    final int listEnd = indexOfOrThrow(topologyString, before, listBegin);
    final var parsedList =
        Arrays.stream(topologyString.substring(listBegin, listEnd).split(","))
            .map(String::strip)
            .collect(Collectors.toList());
    return ParsingRes.of(parsedList, listEnd);
  }

  int indexAfterString(String topologyString, String str, int fromIndex) {
    final int index = topologyString.indexOf(str, fromIndex);
    return index == -1 ? index : index + str.length();
  }

  int indexAfterStringOrThrow(String topologyString, String str, int fromIndex) {
    final int index = indexOfOrThrow(topologyString, str, fromIndex);
    return index + str.length();
  }

  private int indexOfOrThrow(String topologyString, String str, int fromIndex) {
    final int index = topologyString.indexOf(str, fromIndex);
    if (fromIndex == -1 || fromIndex >= topologyString.length() || index == -1) {
      throw new InvalidStreamTopologyString(
          String.format("cannot find string %s in topology string", str));
    }
    return index;
  }

  static class NodeAdjacencyPair {
    GraphNode node;
    List<String> adjacencyList;

    static NodeAdjacencyPair of(GraphNode node, List<String> adjacencyList) {
      final var pair = new NodeAdjacencyPair();
      pair.node = node;
      pair.adjacencyList = adjacencyList;
      return pair;
    }
  }

  static class ParsingRes<T> {
    T value;
    Integer endIndex;

    static <T> ParsingRes<T> of(T res, int endIndex) {
      final var parsingRes = new ParsingRes<T>();
      parsingRes.value = res;
      parsingRes.endIndex = endIndex;
      return parsingRes;
    }

    boolean isEmpty() {
      return value == null && endIndex == null;
    }
  }
}
