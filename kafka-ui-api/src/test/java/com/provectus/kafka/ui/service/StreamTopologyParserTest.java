package com.provectus.kafka.ui.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser;
import com.provectus.kafka.ui.service.topology.parser.StreamTopologyParserHelper;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import org.junit.jupiter.api.Test;

class StreamTopologyParserTest {
  private final StreamTopologyParser parser =
      new StreamTopologyParser(new StreamTopologyParserHelper());
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Test
  void edgeCasesTest() {
    assertThrows(InvalidStreamTopologyString.class, () -> parser.parse(""));
    assertThrows(InvalidStreamTopologyString.class, () -> parser.parse(null));
    assertThrows(InvalidStreamTopologyString.class, () -> parser.parse("invalid topology"));
    assertThrows(InvalidStreamTopologyString.class,
        () -> parser.parse("Topologies:\n"
            + "    Source: KSTREAM-SOURCE-0000000000 (topics: [inputTopic])\n"
            + "      --> KSTREAM-KEY-SELECT-0000000001\n"
            + "    Processor: KSTREAM-KEY-SELECT-0000000001 (stores: [])\n"
            + "      --> count-repartition-filter\n"
            + "      <-- KSTREAM-SOURCE-0000000000"));
    assertThrows(InvalidStreamTopologyString.class,
        () -> parser.parse(
            "Topologies:\n"
                + "    Processor: KSTREAM-KEY-SELECT-0000000002 (stores: [])\n"
                + "      --> KSTREAM-KEY-SELECT-0000000002-repartition-filter\n"
                + "      <-- KSTREAM-SOURCE-0000000000\n"
                + "    Processor: KSTREAM-KEY-SELECT-0000000002-repartition-filter (stores: [])\n"
                + "      --> KSTREAM-KEY-SELECT-0000000002-repartition-sink\n"
                + "      <-- KSTREAM-KEY-SELECT-0000000002"));
  }

  @Test
  void parseTest() throws URISyntaxException, IOException {
    var topologyPath = Paths
        .get(getClass().getClassLoader().getResource("test/topologies/test topology.txt").toURI());
    var topology = Files.readString(topologyPath);

    final var expected = getExpectedTestTopology();
    final var actual = parser.parse(topology);

    final var prettyObjectWriter = objectMapper.writerWithDefaultPrettyPrinter();
    assertEquals(prettyObjectWriter.writeValueAsString(expected),
        prettyObjectWriter.writeValueAsString(actual));
  }

  private ProcessorTopologyDTO getExpectedTestTopology() {
    // init topology objects
    final ProcessorTopologyDTO processorTopology = new ProcessorTopologyDTO();
    processorTopology.setTopicsNumber(4);
    processorTopology.setProcessorsNumber(11);

    final TopologyGraphDTO topologyGraph = getTopologyGraph();
    processorTopology.setTopology(topologyGraph);

    final SubTopologyNodeDTO subTopologyNode = new SubTopologyNodeDTO();
    subTopologyNode.setName("0");
    subTopologyNode.setType(GraphNodeTypeDTO.SUB_TOPOLOGY);

    final TopologyGraphDTO subTopologyGraph = getTopologyGraph();
    subTopologyNode.setSubTopology(subTopologyGraph);

    final SubTopologyNodeDTO subTopologyNode1 = new SubTopologyNodeDTO();
    subTopologyNode1.setName("1");
    subTopologyNode1.setType(GraphNodeTypeDTO.SUB_TOPOLOGY);

    final TopologyGraphDTO subTopologyGraph1 = getTopologyGraph();
    subTopologyNode1.setSubTopology(subTopologyGraph1);

    //init node objects
    // sub topology 0 nodes
    final TopicNodeDTO topicNode = getTopicNode("inputTopic");
    final var sub0_sourceProcessor =
        getSourceProcessorNode("KSTREAM-SOURCE-0000000000", List.of(topicNode.getName()));
    final var sub0_processor1 =
        getProcessorNode("KSTREAM-KEY-SELECT-0000000001", List.of());
    final var sub0_processor2 =
        getProcessorNode("count-repartition-filter", List.of());
    final var sub0_sinkTopic = getTopicNode("count-repartition");
    final var sub0_sinkProcessor =
        getSinkProcessorNode("count-repartition-sink", sub0_sinkTopic.getName());

    // sub topology 1 nodes
    final TopicNodeDTO topicNode1 = getTopicNode("count-repartition");
    final SourceProcessorNodeDTO sub1_sourceProcessor =
        getSourceProcessorNode("count-repartition-source", List.of(topicNode1.getName()));
    final ProcessorNodeDTO sub1_processor1 =
        getProcessorNode("KSTREAM-AGGREGATE-0000000002", List.of("count-store"));
    final ProcessorNodeDTO sub1_processor2 =
        getProcessorNode("KSTREAM-AGGREGATE-0000000008", List.of("windowed-count-store"));
    final ProcessorNodeDTO sub1_processor3 =
        getProcessorNode("KTABLE-TOSTREAM-0000000006", List.of());
    final ProcessorNodeDTO sub1_processor4 =
        getProcessorNode("KTABLE-TOSTREAM-0000000012", List.of());
    final TopicNodeDTO sub1_sinkTopic1 = getTopicNode("count-topic");
    final TopicNodeDTO sub1_sinkTopic2 = getTopicNode("windowed-count");
    final SinkProcessorNodeDTO sub1_sink =
        getSinkProcessorNode("KSTREAM-SINK-0000000007", sub1_sinkTopic1.getName());
    final SinkProcessorNodeDTO sub2_sink =
        getSinkProcessorNode("KSTREAM-SINK-0000000013", sub1_sinkTopic2.getName());


    // establish sub topology 0 node connections
    putNode(subTopologyGraph, sub0_sourceProcessor, List.of(sub0_processor1.getName()));
    putNode(subTopologyGraph, sub0_processor1, List.of(sub0_processor2.getName()));
    putNode(subTopologyGraph, sub0_processor2, List.of(sub0_sinkProcessor.getName()));
    putNode(subTopologyGraph, sub0_sinkProcessor, List.of());

    // establish sub topology 1 node connections
    putNode(subTopologyGraph1, sub1_sourceProcessor,
        List.of(sub1_processor1.getName(), sub1_processor2.getName()));
    putNode(subTopologyGraph1, sub1_processor1, List.of(sub1_processor3.getName()));
    putNode(subTopologyGraph1, sub1_processor2, List.of(sub1_processor4.getName()));
    putNode(subTopologyGraph1, sub1_processor3, List.of(sub1_sink.getName()));
    putNode(subTopologyGraph1, sub1_processor4, List.of(sub2_sink.getName()));
    putNode(subTopologyGraph1, sub1_sink, List.of());
    putNode(subTopologyGraph1, sub2_sink, List.of());

    // establish outer topology node connections
    putNode(topologyGraph, topicNode, List.of(subTopologyNode.getName()));
    putNode(topologyGraph, subTopologyNode, List.of(sub0_sinkTopic.getName()));
    putNode(topologyGraph, sub0_sinkTopic, List.of(subTopologyNode1.getName()));
    putNode(topologyGraph, subTopologyNode1,
        List.of(sub1_sinkTopic1.getName(), sub1_sinkTopic2.getName()));
    putNode(topologyGraph, sub1_sinkTopic1, List.of());
    putNode(topologyGraph, sub1_sinkTopic2, List.of());

    return processorTopology;
  }

  private void putNode(TopologyGraphDTO subTopologyGraph,
                       GraphNodeDTO node,
                       List<String> adjItems) {
    subTopologyGraph.putNodesItem(node.getName(), node);
    subTopologyGraph.getAdjacency().putIfAbsent(node.getName(), new ArrayList<>());
    subTopologyGraph.getAdjacency().get(node.getName()).addAll(adjItems);
  }

  private TopologyGraphDTO getTopologyGraph() {
    final TopologyGraphDTO topologyGraph = new TopologyGraphDTO();
    topologyGraph.setNodes(new LinkedHashMap<>());
    topologyGraph.setAdjacency(new LinkedHashMap<>());
    return topologyGraph;
  }

  private TopicNodeDTO getTopicNode(String name) {
    final TopicNodeDTO topicNode = new TopicNodeDTO();
    topicNode.setName(name);
    topicNode.setType(GraphNodeTypeDTO.TOPIC);
    return topicNode;
  }

  private SourceProcessorNodeDTO getSourceProcessorNode(String name, List<String> topics) {
    final var sourceProcessorNode = new SourceProcessorNodeDTO();
    sourceProcessorNode.setName(name);
    sourceProcessorNode.setType(GraphNodeTypeDTO.SOURCE_PROCESSOR);
    sourceProcessorNode.setTopics(topics);
    return sourceProcessorNode;
  }

  private ProcessorNodeDTO getProcessorNode(String name, List<String> stores) {
    final var processorNode = new ProcessorNodeDTO();
    processorNode.setName(name);
    processorNode.setType(GraphNodeTypeDTO.PROCESSOR);
    processorNode.setStores(stores);
    return processorNode;
  }

  private SinkProcessorNodeDTO getSinkProcessorNode(String name, String topic) {
    final var sinkNode = new SinkProcessorNodeDTO();
    sinkNode.setName(name);
    sinkNode.setType(GraphNodeTypeDTO.SINK_PROCESSOR);
    sinkNode.setTopic(topic);
    return sinkNode;
  }
}