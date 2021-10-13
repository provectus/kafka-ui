package com.provectus.kafka.ui.service.topology.parser;

import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser.TopologyLiterals.NEXT;
import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser.TopologyLiterals.PROCESSOR;
import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser.TopologyLiterals.SINK;
import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser.TopologyLiterals.SOURCE;
import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser.TopologyLiterals.SUB_TOPOLOGY;
import static com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser.TopologyLiterals.TOPIC;

import com.provectus.kafka.ui.exception.InvalidStreamTopologyString;
import com.provectus.kafka.ui.model.GraphNodeDTO;
import com.provectus.kafka.ui.model.GraphNodeTypeDTO;
import com.provectus.kafka.ui.model.ProcessorNodeDTO;
import com.provectus.kafka.ui.model.ProcessorTopologyDTO;
import com.provectus.kafka.ui.model.SinkProcessorNodeDTO;
import com.provectus.kafka.ui.model.SourceProcessorNodeDTO;
import com.provectus.kafka.ui.model.SubTopologyNodeDTO;
import com.provectus.kafka.ui.model.TopicNodeDTO;
import com.provectus.kafka.ui.model.TopologyGraphDTO;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
@Log4j2
public class StreamTopologyParser {
  private final StreamTopologyParserHelper parserHelper;

  public ProcessorTopologyDTO parse(final String topologyString) {
    if (StringUtils.isEmpty(topologyString)) {
      throw new InvalidStreamTopologyString("topology string is empty");
    }

    final var topologyLines = topologyString.lines()
        .skip(1)
        .map(String::strip)
        .collect(Collectors.toList());

    if (topologyLines.isEmpty()) {
      throw new InvalidStreamTopologyString("topology string contains only one line");
    }

    final var processorTopology = new ProcessorTopologyDTO();
    processorTopology.setProcessorsNumber(0);
    processorTopology.setTopicsNumber(0);
    processorTopology.setTopology(getTopologyGraph());
    SubTopologyNodeDTO subTopologyNode = null;

    for (String line : topologyLines) {
      if (line.contains(SUB_TOPOLOGY.value)) {
        subTopologyNode = parseSubTopology(line);
        subTopologyNode.setSubTopology(getTopologyGraph());

      } else {
        if (subTopologyNode == null) {
          throw new InvalidStreamTopologyString("cannot find subTopology");
        }
        if (line.contains(NEXT.value)) {
          putAdjacencyOfLastNode(
              subTopologyNode.getSubTopology().getAdjacency(),
              parserHelper.parseArrayOrThrow(line, NEXT.value));
        } else {
          final var finalSubTopologyNode = subTopologyNode;
          parseSubTopologyNode(line)
              .ifPresent(res -> putParsedNode(processorTopology, finalSubTopologyNode, res));
        }
      }
    }

    return processorTopology;
  }

  private void putAdjacencyOfLastNode(Map<String, List<String>> adjacency,
                                      List<String> nextReferences) {
    int count = 1;
    for (var entry : adjacency.entrySet()) {
      if (count == adjacency.size()) {
        entry.getValue().addAll(nextReferences);
        return;
      }
      count++;
    }
    throw new InvalidStreamTopologyString("cannot find node for adjacency");
  }

  private TopologyGraphDTO getTopologyGraph() {
    final var topologyGraph = new TopologyGraphDTO();
    topologyGraph.setAdjacency(new LinkedHashMap<>());
    topologyGraph.setNodes(new LinkedHashMap<>());
    return topologyGraph;
  }

  private void putParsedNode(ProcessorTopologyDTO processorTopology,
                             SubTopologyNodeDTO subTopologyNode,
                             GraphNodeDTO node) {
    final var topologyGraph = processorTopology.getTopology();
    final var subTopologyGraph = subTopologyNode.getSubTopology();
    subTopologyGraph.putNodesItem(node.getName(), node);
    subTopologyGraph.getAdjacency().putIfAbsent(node.getName(), new ArrayList<>());

    switch (node.getType()) {
      case SOURCE_PROCESSOR:
        processorTopology.setProcessorsNumber(processorTopology.getProcessorsNumber() + 1);
        var source = (SourceProcessorNodeDTO) node;
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
          topologyGraph.getAdjacency()
              .putIfAbsent(subTopologyNode.getName(), new ArrayList<>());
        }

        if (GraphNodeTypeDTO.SINK_PROCESSOR == node.getType()) {
          var sink = (SinkProcessorNodeDTO) node;

          putTopicNode(processorTopology, topologyGraph, sink.getTopic());
          topologyGraph.getAdjacency().get(subTopologyNode.getName()).add(sink.getTopic());
        }
        break;
      default:
        log.warn("unknown topology node type");
        break;
    }
  }

  private void putTopicNode(ProcessorTopologyDTO processorTopology,
                            TopologyGraphDTO topologyGraph,
                            String topic) {
    final var topicNode = new TopicNodeDTO();
    topicNode.setName(topic);
    topicNode.setType(GraphNodeTypeDTO.TOPIC);

    if (!topologyGraph.getNodes().containsKey(topicNode.getName())) {
      processorTopology.setTopicsNumber(processorTopology.getTopicsNumber() + 1);
      topologyGraph.putNodesItem(topicNode.getName(), topicNode);
      topologyGraph.getAdjacency().putIfAbsent(topic, new ArrayList<>());
    }
  }

  private SubTopologyNodeDTO parseSubTopology(String topologyLine) {
    var parsedName =
        parserHelper.parseOrThrow(topologyLine, SUB_TOPOLOGY.value);

    final var subTopologyNode = new SubTopologyNodeDTO();
    subTopologyNode.setName(parsedName.value);
    subTopologyNode.setType(GraphNodeTypeDTO.SUB_TOPOLOGY);
    return subTopologyNode;
  }

  private Optional<GraphNodeDTO> parseSubTopologyNode(String topologyLine) {
    if (topologyLine.contains(SOURCE.value)) {
      return Optional.of(parseSource(topologyLine));
    } else if (topologyLine.contains(PROCESSOR.value)) {
      return Optional.of(parseProcessor(topologyLine));
    } else if (topologyLine.contains(SINK.value)) {
      return Optional.of(parseSink(topologyLine));
    } else {
      return Optional.empty();
    }
  }

  private GraphNodeDTO parseSource(String topologyLine) {
    final var parsedSourceName =
        parserHelper.parseOrThrow(topologyLine, SOURCE.value, 0, "(");
    final var parsedTopics =
        parserHelper.parseArrayOrThrow(topologyLine, "[", parsedSourceName.endIndex, "]");

    final var sourceProcessorNode = new SourceProcessorNodeDTO();
    sourceProcessorNode.setName(parsedSourceName.value);
    sourceProcessorNode.setType(GraphNodeTypeDTO.SOURCE_PROCESSOR);
    sourceProcessorNode.setTopics(parsedTopics);
    return sourceProcessorNode;
  }

  private GraphNodeDTO parseProcessor(String topologyLine) {
    final var parsedProcessorName =
        parserHelper.parseOrThrow(topologyLine, PROCESSOR.value, 0, "(");
    final var parsedStores =
        parserHelper.parseArrayOrThrow(topologyLine, "[", parsedProcessorName.endIndex, "]");

    final var processorNode = new ProcessorNodeDTO();
    processorNode.setName(parsedProcessorName.value);
    processorNode.setType(GraphNodeTypeDTO.PROCESSOR);
    processorNode.setStores(parsedStores);

    return processorNode;
  }

  private GraphNodeDTO parseSink(String topologyLine) {
    final var parsedSinkName =
        parserHelper.parseOrThrow(topologyLine, SINK.value, 0, "(");
    final var parsedTopic =
        parserHelper.parseOrThrow(topologyLine, TOPIC.value, parsedSinkName.endIndex, ")");

    final var sinkNode = new SinkProcessorNodeDTO();
    sinkNode.setName(parsedSinkName.value);
    sinkNode.setType(GraphNodeTypeDTO.SINK_PROCESSOR);
    sinkNode.setTopic(parsedTopic.value);

    return sinkNode;
  }

  enum TopologyLiterals {
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
