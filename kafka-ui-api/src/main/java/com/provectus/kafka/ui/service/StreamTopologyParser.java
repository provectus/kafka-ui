package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.service.StreamTopologyParser.TopologyLiterals.NEXT;
import static com.provectus.kafka.ui.service.StreamTopologyParser.TopologyLiterals.PREVIOUS;
import static com.provectus.kafka.ui.service.StreamTopologyParser.TopologyLiterals.PROCESSOR;
import static com.provectus.kafka.ui.service.StreamTopologyParser.TopologyLiterals.SINK;
import static com.provectus.kafka.ui.service.StreamTopologyParser.TopologyLiterals.SOURCE;
import static com.provectus.kafka.ui.service.StreamTopologyParser.TopologyLiterals.SUB_TOPOLOGY;
import static com.provectus.kafka.ui.service.StreamTopologyParser.TopologyLiterals.TOPIC;

import com.provectus.kafka.ui.exception.InvalidStreamTopologyString;
import com.provectus.kafka.ui.model.GraphNode;
import com.provectus.kafka.ui.model.GraphNodeType;
import com.provectus.kafka.ui.model.ProcessorNode;
import com.provectus.kafka.ui.model.ProcessorTopology;
import com.provectus.kafka.ui.model.SinkProcessorNode;
import com.provectus.kafka.ui.model.SourceProcessorNode;
import com.provectus.kafka.ui.model.SubTopologyNode;
import com.provectus.kafka.ui.model.TopicNode;
import com.provectus.kafka.ui.model.TopologyGraph;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class StreamTopologyParser {
  public ProcessorTopology parse(final String topologyString) {
    if (StringUtils.isEmpty(topologyString)) {
      throw new InvalidStreamTopologyString("topology string is empty");
    }

    final var processorTopology = new ProcessorTopology();
    processorTopology.setProcessorsNumber(0);
    processorTopology.setTopicsNumber(0);

    final var topologyGraph = new TopologyGraph();
    topologyGraph.setAdjacency(new LinkedHashMap<>());
    topologyGraph.setNodes(new LinkedHashMap<>());

    processorTopology.setTopology(topologyGraph);

    int topologyLeftIndex = 0;
    boolean endOfFile = false;
    while (!endOfFile) {

      final var parsedSubTopology =
          parseSubTopology(topologyString, topologyLeftIndex);

      final var subTopologyGraph = new TopologyGraph();
      subTopologyGraph.setAdjacency(new LinkedHashMap<>());
      subTopologyGraph.setNodes(new LinkedHashMap<>());
      parsedSubTopology.value.setSubTopology(subTopologyGraph);

      int subTopologyLeftIndex = parsedSubTopology.endIndex;
      boolean hasNext = true;
      do {
        final var resultOpt =
            parseSubTopologyNode(topologyString, subTopologyLeftIndex);

        endOfFile = resultOpt.map(ParsingRes::isEmpty).orElse(Boolean.TRUE);
        if (!endOfFile) {
          resultOpt.map(result -> result.value).ifPresent(
              res -> putParsedNode(processorTopology, subTopologyGraph, parsedSubTopology.value,
                  res)
          );
          final var endIndex = resultOpt.map(res -> res.endIndex)
              .orElseThrow(() -> new IllegalArgumentException("endIndex is empty"));
          if (subTopologyLeftIndex == endIndex) {
            hasNext = false;
            topologyLeftIndex = endIndex;
          } else {
            subTopologyLeftIndex = endIndex;
          }
        } else {
          hasNext = false;
        }
      } while (hasNext);
    }
    return processorTopology;
  }

  private void putParsedNode(ProcessorTopology processorTopology, TopologyGraph subTopologyGraph,
                             SubTopologyNode subTopologyNode,
                             NodeAdjacencyPair nodeAdjPair) {
    final var topologyGraph = processorTopology.getTopology();
    subTopologyGraph.putNodesItem(nodeAdjPair.node.getName(), nodeAdjPair.node);
    subTopologyGraph.putAdjacencyItem(nodeAdjPair.node.getName(), nodeAdjPair.adjacencyList);

    switch (nodeAdjPair.node.getType()) {
      case SOURCE_PROCESSOR:
        processorTopology.setProcessorsNumber(processorTopology.getProcessorsNumber() + 1);
        var source = (SourceProcessorNode) nodeAdjPair.node;
        source.getTopics()
            .forEach(topic -> {
                  putTopicNode(processorTopology, topologyGraph, topic);
                  topologyGraph.getAdjacency().get(topic).add(subTopologyNode.getName());
                }
            );
        break;
      case PROCESSOR:
      case SINK_PROCESSOR:
        processorTopology.setProcessorsNumber(processorTopology.getProcessorsNumber() + 1);
        if (!topologyGraph.getNodes().containsKey(subTopologyNode.getName())) {
          topologyGraph.putNodesItem(subTopologyNode.getName(), subTopologyNode);
          topologyGraph.getAdjacency().putIfAbsent(subTopologyNode.getName(), new ArrayList<>());
        }

        if (GraphNodeType.SINK_PROCESSOR == nodeAdjPair.node.getType()) {
          var sink = (SinkProcessorNode) nodeAdjPair.node;

          putTopicNode(processorTopology, topologyGraph, sink.getTopic());
          topologyGraph.getAdjacency().get(subTopologyNode.getName()).add(sink.getTopic());
        }
        break;
    }
  }

  private void putTopicNode(ProcessorTopology processorTopology, TopologyGraph topologyGraph,
                            String topic) {
    final var topicNode = new TopicNode();
    topicNode.setName(topic);
    topicNode.setType(GraphNodeType.TOPIC);

    if (!topologyGraph.getNodes().containsKey(topicNode.getName())) {
      processorTopology.setTopicsNumber(processorTopology.getTopicsNumber() + 1);
      topologyGraph.putNodesItem(topicNode.getName(), topicNode);
      topologyGraph.getAdjacency().putIfAbsent(topic, new ArrayList<>());
    }
  }

  private ParsingRes<SubTopologyNode> parseSubTopology(String topologyString,
                                                       int topologyLeftIndex) {
    if (topologyLeftIndex >= topologyString.length() ||
        topologyString.indexOf(SUB_TOPOLOGY.value, topologyLeftIndex) == -1) {
      throw new InvalidStreamTopologyString(
          String.format("Cannot find %s constant in string", SUB_TOPOLOGY.value));
    }
    var parsedName = parseOrThrow(topologyString, SUB_TOPOLOGY.value, topologyLeftIndex, "\n");

    final var subTopologyNode = new SubTopologyNode();
    subTopologyNode.setName(parsedName.value);
    subTopologyNode.setType(GraphNodeType.SUB_TOPOLOGY);
    return ParsingRes.of(subTopologyNode, parsedName.endIndex);
  }

  private Optional<ParsingRes<NodeAdjacencyPair>> parseSubTopologyNode(String topologyString,
                                                                       int subTopologyLeftIndex) {
    final var stringFromNodeName =
        topologyString.substring(subTopologyLeftIndex).strip();

    if (stringFromNodeName.startsWith(SOURCE.value)) {
      return Optional.of(parseSource(topologyString, subTopologyLeftIndex));
    } else if (stringFromNodeName.startsWith(PROCESSOR.value)) {
      return Optional.of(parseProcessor(topologyString, subTopologyLeftIndex));
    } else if (stringFromNodeName.startsWith(SINK.value)) {
      return Optional.of(parseSink(topologyString, subTopologyLeftIndex));
    } else if (stringFromNodeName.startsWith(PREVIOUS.value)) {
      return Optional.ofNullable(parsePrevious(topologyString, subTopologyLeftIndex));
    } else {
      return Optional.of(ParsingRes.of(null, subTopologyLeftIndex));
    }
  }

  private ParsingRes<NodeAdjacencyPair> parseSource(String topologyString, int fromIndex) {
    final var parsedSourceName =
        parseOrThrow(topologyString, SOURCE.value, fromIndex, "(");
    final var parsedTopics =
        parseArrayOrThrow(topologyString, "[", parsedSourceName.endIndex, "]");
    final var nextReferences =
        parseArrayOrThrow(topologyString, NEXT.value, parsedTopics.endIndex, "\n");

    final var sourceProcessorNode = new SourceProcessorNode();
    sourceProcessorNode.setName(parsedSourceName.value);
    sourceProcessorNode.setType(GraphNodeType.SOURCE_PROCESSOR);
    sourceProcessorNode.setTopics(parsedTopics.value);
    final var nodeAdjacencyPair =
        NodeAdjacencyPair.of(sourceProcessorNode, nextReferences.value);
    return ParsingRes.of(nodeAdjacencyPair, nextReferences.endIndex);
  }

  private ParsingRes<NodeAdjacencyPair> parseProcessor(String topologyString, int fromIndex) {
    final var parsedProcessorName =
        parseOrThrow(topologyString, PROCESSOR.value, fromIndex, "(");
    final var parsedStores =
        parseArrayOrThrow(topologyString, "[", parsedProcessorName.endIndex, "]");
    final var nextReferences =
        parseArrayOrThrow(topologyString, NEXT.value, parsedStores.endIndex, "\n");

    final var processorNode = new ProcessorNode();
    processorNode.setName(parsedProcessorName.value);
    processorNode.setType(GraphNodeType.PROCESSOR);
    processorNode.setStores(parsedStores.value);

    final var nodeAdjacencyPair = NodeAdjacencyPair.of(processorNode, nextReferences.value);
    return ParsingRes.of(nodeAdjacencyPair, nextReferences.endIndex + 1);
  }

  private ParsingRes<NodeAdjacencyPair> parseSink(String topologyString, int fromIndex) {
    final var parsedSinkName =
        parseOrThrow(topologyString, SINK.value, fromIndex, "(");
    final var parsedTopic =
        parseOrThrow(topologyString, TOPIC.value, parsedSinkName.endIndex, ")");

    final var sinkNode = new SinkProcessorNode();
    sinkNode.setName(parsedSinkName.value);
    sinkNode.setType(GraphNodeType.SINK_PROCESSOR);
    sinkNode.setTopic(parsedTopic.value);

    final var nodeAdjacencyPair = NodeAdjacencyPair.of(sinkNode, Collections.emptyList());
    return ParsingRes.of(nodeAdjacencyPair, parsedTopic.endIndex + 1);
  }

  private ParsingRes<NodeAdjacencyPair> parsePrevious(String topologyString,
                                                      int fromIndex) {
    final int afterPrevious =
        indexAfterStringOrThrow(topologyString, PREVIOUS.value, fromIndex);
    final int afterLineBreak = indexAfterString(topologyString, "\n", afterPrevious);
    if (afterLineBreak == -1) {
      return null;
    } else {
      return ParsingRes.of(null, afterLineBreak);
    }
  }

  private ParsingRes<String> parseOrThrow(String topologyString, String after, int fromIndex,
                                          String before) {
    final int beginIndex = indexAfterStringOrThrow(topologyString, after, fromIndex);
    final int endIndex = indexOfOrThrow(topologyString, before, beginIndex);
    final var result = topologyString.substring(beginIndex, endIndex).strip();
    return ParsingRes.of(result, endIndex);
  }

  private ParsingRes<List<String>> parseArrayOrThrow(String topologyString, String after,
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

  private int indexAfterString(String topologyString, String str, int fromIndex) {
    final int index = topologyString.indexOf(str, fromIndex);
    return index == -1 ? index : index + str.length();
  }

  private int indexAfterStringOrThrow(String topologyString, String str, int fromIndex) {
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

  private static class NodeAdjacencyPair {
    GraphNode node;
    List<String> adjacencyList;

    static NodeAdjacencyPair of(GraphNode node, List<String> adjacencyList) {
      final var pair = new NodeAdjacencyPair();
      pair.node = node;
      pair.adjacencyList = adjacencyList;
      return pair;
    }
  }

  private static class ParsingRes<T> {
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

  enum TopologyLiterals {
    TOPOLOGIES("Topologies:"),
    SUB_TOPOLOGY("Sub-topology:"),
    SOURCE("Source:"),
    PROCESSOR("Processor:"),
    SINK("Sink:"),
    NEXT("-->"),
    PREVIOUS("<--"),
    TOPIC("topic:");
    public final String value;

    TopologyLiterals(String value) {
      this.value = value;
    }
  }
}
