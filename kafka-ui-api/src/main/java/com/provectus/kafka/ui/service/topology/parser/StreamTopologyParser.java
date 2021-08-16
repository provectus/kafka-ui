package com.provectus.kafka.ui.service.topology.parser;

import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser.TopologyLiterals.NEXT;
import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser.TopologyLiterals.PREVIOUS;
import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser.TopologyLiterals.PROCESSOR;
import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser.TopologyLiterals.SINK;
import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser.TopologyLiterals.SOURCE;
import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser.TopologyLiterals.SUB_TOPOLOGY;
import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser.TopologyLiterals.TOPIC;
import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParserHelper.NodeAdjacencyPair;
import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParserHelper.ParsingRes;

import com.provectus.kafka.ui.exception.InvalidStreamTopologyString;
import com.provectus.kafka.ui.model.GraphNodeType;
import com.provectus.kafka.ui.model.ProcessorNode;
import com.provectus.kafka.ui.model.ProcessorTopology;
import com.provectus.kafka.ui.model.SinkProcessorNode;
import com.provectus.kafka.ui.model.SourceProcessorNode;
import com.provectus.kafka.ui.model.SubTopologyNode;
import com.provectus.kafka.ui.model.TopicNode;
import com.provectus.kafka.ui.model.TopologyGraph;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class StreamTopologyParser {
  private final StreamTopologyParserHelper parserHelper;

  public ProcessorTopology parse(final String topologyString) {
    if (StringUtils.isEmpty(topologyString)) {
      throw new InvalidStreamTopologyString("topology string is empty");
    }

    final var processorTopology = new ProcessorTopology();
    processorTopology.setProcessorsNumber(0);
    processorTopology.setTopicsNumber(0);

    final TopologyGraph topologyGraph = getTopologyGraph();
    processorTopology.setTopology(topologyGraph);

    int topologyLeftIndex = 0;
    boolean endOfFile = false;
    while (!endOfFile) {

      final var parsedSubTopology =
          parseSubTopology(topologyString, topologyLeftIndex);

      final TopologyGraph subTopologyGraph = getTopologyGraph();
      parsedSubTopology.value.setSubTopology(subTopologyGraph);

      int subTopologyLeftIndex = parsedSubTopology.endIndex;
      boolean hasNext = true;
      while (hasNext) {
        final var resultOpt =
            parseSubTopologyNode(topologyString, subTopologyLeftIndex);

        endOfFile =
            resultOpt.map(res -> Boolean.FALSE).orElse(Boolean.TRUE);
        if (endOfFile) {
          hasNext = false;
        } else {
          resultOpt
              .map(res -> res.value)
              .ifPresent(res ->
                  putParsedNode(processorTopology, subTopologyGraph, parsedSubTopology.value, res)
              );
          final var endIndex = resultOpt.map(res -> res.endIndex).orElse(null);
          if (subTopologyLeftIndex == endIndex) {
            hasNext = false;
            topologyLeftIndex = endIndex;
          } else {
            subTopologyLeftIndex = endIndex;
          }
        }
      }
    }
    return processorTopology;
  }

  private TopologyGraph getTopologyGraph() {
    final var topologyGraph = new TopologyGraph();
    topologyGraph.setAdjacency(new LinkedHashMap<>());
    topologyGraph.setNodes(new LinkedHashMap<>());
    return topologyGraph;
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
    var parsedName =
        parserHelper.parseOrThrow(topologyString, SUB_TOPOLOGY.value, topologyLeftIndex, "\n");

    final var subTopologyNode = new SubTopologyNode();
    subTopologyNode.setName(parsedName.value);
    subTopologyNode.setType(GraphNodeType.SUB_TOPOLOGY);
    return ParsingRes.of(subTopologyNode, parsedName.endIndex);
  }

  private Optional<ParsingRes<NodeAdjacencyPair>> parseSubTopologyNode(String topologyString,
                                                                       int subTopologyLeftIndex) {
    final var stringFromNodeName =
        topologyString.substring(subTopologyLeftIndex).strip();

    if (stringFromNodeName.startsWith(SUB_TOPOLOGY.value)) {
      return Optional.of(ParsingRes.of(null, subTopologyLeftIndex));
    } else if (stringFromNodeName.startsWith(SOURCE.value)) {
      return Optional.of(parseSource(topologyString, subTopologyLeftIndex));
    } else if (stringFromNodeName.startsWith(PROCESSOR.value)) {
      return Optional.of(parseProcessor(topologyString, subTopologyLeftIndex));
    } else if (stringFromNodeName.startsWith(SINK.value)) {
      return Optional.of(parseSink(topologyString, subTopologyLeftIndex));
    } else if (stringFromNodeName.startsWith(PREVIOUS.value)) {
      return Optional.of(parsePrevious(topologyString, subTopologyLeftIndex));
    } else {
      return Optional.empty();
    }
  }

  private ParsingRes<NodeAdjacencyPair> parseSource(String topologyString, int fromIndex) {
    final var parsedSourceName =
        parserHelper.parseOrThrow(topologyString, SOURCE.value, fromIndex, "(");
    final var parsedTopics =
        parserHelper.parseArrayOrThrow(topologyString, "[", parsedSourceName.endIndex, "]");
    final var nextReferences =
        parserHelper.parseArrayOrThrow(topologyString, NEXT.value, parsedTopics.endIndex, "\n");

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
        parserHelper.parseOrThrow(topologyString, PROCESSOR.value, fromIndex, "(");
    final var parsedStores =
        parserHelper.parseArrayOrThrow(topologyString, "[", parsedProcessorName.endIndex, "]");
    final var nextReferences =
        parserHelper.parseArrayOrThrow(topologyString, NEXT.value, parsedStores.endIndex, "\n");

    final var processorNode = new ProcessorNode();
    processorNode.setName(parsedProcessorName.value);
    processorNode.setType(GraphNodeType.PROCESSOR);
    processorNode.setStores(parsedStores.value);

    final var nodeAdjacencyPair = NodeAdjacencyPair.of(processorNode, nextReferences.value);
    return ParsingRes.of(nodeAdjacencyPair, nextReferences.endIndex + 1);
  }

  private ParsingRes<NodeAdjacencyPair> parseSink(String topologyString, int fromIndex) {
    final var parsedSinkName =
        parserHelper.parseOrThrow(topologyString, SINK.value, fromIndex, "(");
    final var parsedTopic =
        parserHelper.parseOrThrow(topologyString, TOPIC.value, parsedSinkName.endIndex, ")");

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
        parserHelper.indexAfterStringOrThrow(topologyString, PREVIOUS.value, fromIndex);
    final int afterLineBreak = parserHelper.indexAfterString(topologyString, "\n", afterPrevious);
    return afterLineBreak == -1
        ? ParsingRes.of(null, afterPrevious)
        : ParsingRes.of(null, afterLineBreak);
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
