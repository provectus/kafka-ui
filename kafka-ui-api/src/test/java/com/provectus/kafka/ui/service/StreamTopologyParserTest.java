package com.provectus.kafka.ui.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.databind.ObjectMapper;
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

  private ProcessorTopology getExpectedTestTopology() {
    // init topology objects
    final ProcessorTopology processorTopology = new ProcessorTopology();
    processorTopology.setTopicsNumber(4);
    processorTopology.setProcessorsNumber(11);

    final TopologyGraph topologyGraph = getTopologyGraph();
    processorTopology.setTopology(topologyGraph);

    final SubTopologyNode subTopologyNode = new SubTopologyNode();
    subTopologyNode.setName("0");
    subTopologyNode.setType(GraphNodeType.SUB_TOPOLOGY);

    final TopologyGraph subTopologyGraph = getTopologyGraph();
    subTopologyNode.setSubTopology(subTopologyGraph);

    final SubTopologyNode subTopologyNode1 = new SubTopologyNode();
    subTopologyNode1.setName("1");
    subTopologyNode1.setType(GraphNodeType.SUB_TOPOLOGY);

    final TopologyGraph subTopologyGraph1 = getTopologyGraph();
    subTopologyNode1.setSubTopology(subTopologyGraph1);

    //init node objects
    // sub topology 0 nodes
    final TopicNode topicNode = getTopicNode("inputTopic");
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
    final TopicNode topicNode1 = getTopicNode("count-repartition");
    final SourceProcessorNode sub1_sourceProcessor =
        getSourceProcessorNode("count-repartition-source", List.of(topicNode1.getName()));
    final ProcessorNode sub1_processor1 =
        getProcessorNode("KSTREAM-AGGREGATE-0000000002", List.of("count-store"));
    final ProcessorNode sub1_processor2 =
        getProcessorNode("KSTREAM-AGGREGATE-0000000008", List.of("windowed-count-store"));
    final ProcessorNode sub1_processor3 =
        getProcessorNode("KTABLE-TOSTREAM-0000000006", List.of());
    final ProcessorNode sub1_processor4 =
        getProcessorNode("KTABLE-TOSTREAM-0000000012", List.of());
    final TopicNode sub1_sinkTopic1 = getTopicNode("count-topic");
    final TopicNode sub1_sinkTopic2 = getTopicNode("windowed-count");
    final SinkProcessorNode sub1_sink =
        getSinkProcessorNode("KSTREAM-SINK-0000000007", sub1_sinkTopic1.getName());
    final SinkProcessorNode sub2_sink =
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

  private void putNode(TopologyGraph subTopologyGraph,
                       GraphNode node,
                       List<String> adjItems) {
    subTopologyGraph.putNodesItem(node.getName(), node);
    subTopologyGraph.getAdjacency().putIfAbsent(node.getName(), new ArrayList<>());
    subTopologyGraph.getAdjacency().get(node.getName()).addAll(adjItems);
  }

  private TopologyGraph getTopologyGraph() {
    final TopologyGraph topologyGraph = new TopologyGraph();
    topologyGraph.setNodes(new LinkedHashMap<>());
    topologyGraph.setAdjacency(new LinkedHashMap<>());
    return topologyGraph;
  }

  private TopicNode getTopicNode(String name) {
    final TopicNode topicNode = new TopicNode();
    topicNode.setName(name);
    topicNode.setType(GraphNodeType.TOPIC);
    return topicNode;
  }

  private SourceProcessorNode getSourceProcessorNode(String name, List<String> topics) {
    final var sourceProcessorNode = new SourceProcessorNode();
    sourceProcessorNode.setName(name);
    sourceProcessorNode.setType(GraphNodeType.SOURCE_PROCESSOR);
    sourceProcessorNode.setTopics(topics);
    return sourceProcessorNode;
  }

  private ProcessorNode getProcessorNode(String name, List<String> stores) {
    final var processorNode = new ProcessorNode();
    processorNode.setName(name);
    processorNode.setType(GraphNodeType.PROCESSOR);
    processorNode.setStores(stores);
    return processorNode;
  }

  private SinkProcessorNode getSinkProcessorNode(String name, String topic) {
    final var sinkNode = new SinkProcessorNode();
    sinkNode.setName(name);
    sinkNode.setType(GraphNodeType.SINK_PROCESSOR);
    sinkNode.setTopic(topic);
    return sinkNode;
  }
}