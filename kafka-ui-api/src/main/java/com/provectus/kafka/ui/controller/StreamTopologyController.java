package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.StreamTopologyApi;
import com.provectus.kafka.ui.model.GlobalTopology;
import com.provectus.kafka.ui.model.ProcessorNode;
import com.provectus.kafka.ui.model.ProcessorTopologyNode;
import com.provectus.kafka.ui.model.SinkProcessorNode;
import com.provectus.kafka.ui.model.SourceProcessorNode;
import com.provectus.kafka.ui.model.SubTopologyNode;
import com.provectus.kafka.ui.model.TopicNode;
import com.provectus.kafka.ui.model.TopologyGraph;
import com.provectus.kafka.ui.model.TopologyNode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
public class StreamTopologyController implements StreamTopologyApi {
  @Override
  @ResponseStatus(HttpStatus.NOT_IMPLEMENTED)
  public Mono<ResponseEntity<GlobalTopology>> getStreamTopology(
      ServerWebExchange exchange) {
    return Mono.empty();
  }

  @Override
  public Mono<ResponseEntity<GlobalTopology>> getDummyStreamTopology(ServerWebExchange exchange) {
    return Mono.just(getDummyTopology())
        .map(ResponseEntity::ok);
  }

  private static GlobalTopology getDummyTopology() {
    final GlobalTopology globalTopology = new GlobalTopology();
    final TopologyGraph topology = new TopologyGraph();
    globalTopology.setTopology(topology);

    final TopologyNode sourceConnector = new TopologyNode();
    sourceConnector.setName("source connector");
    sourceConnector.setType(TopologyNode.TypeEnum.SOURCE_CONNECTOR);

    final TopologyNode inputTopic = new TopicNode();
    inputTopic.setName("inputTopic");
    inputTopic.setType(TopologyNode.TypeEnum.TOPIC);

    final ProcessorTopologyNode topologyNode = new ProcessorTopologyNode();
    topologyNode.setName("topology 1");
    topologyNode.setType(TopologyNode.TypeEnum.PROCESSOR_TOPOLOGY);

    final TopologyNode sinkTopic = new TopicNode();
    sinkTopic.setName("streams-count-resolved");
    sinkTopic.setType(TopologyNode.TypeEnum.TOPIC);

    final TopologyNode sinkConnector = new ProcessorTopologyNode();
    sinkConnector.setName("sink connector");
    sinkConnector.setType(TopologyNode.TypeEnum.SINK_CONNECTOR);

    final Map<String, List<String>> globalAdjacency = new LinkedHashMap<>();
    globalAdjacency.put(sourceConnector.getName(), List.of(inputTopic.getName()));
    globalAdjacency.put(inputTopic.getName(), List.of(topologyNode.getName()));
    globalAdjacency.put(topologyNode.getName(), List.of(sinkTopic.getName()));
    globalAdjacency.put(sinkTopic.getName(), List.of(sinkConnector.getName()));
    globalAdjacency.put(sinkConnector.getName(), List.of());

    final Map<String, TopologyNode> globalNodes = new LinkedHashMap<>();
    globalNodes.put(sourceConnector.getName(), sourceConnector);
    globalNodes.put(inputTopic.getName(), inputTopic);
    globalNodes.put(topologyNode.getName(), topologyNode);
    globalNodes.put(sinkTopic.getName(), sinkTopic);
    globalNodes.put(sinkConnector.getName(), sinkConnector);

    topology.setAdjacency(globalAdjacency);
    topology.setNodes(globalNodes);

    final SubTopologyNode subTopologyNode =
        getSubTopologyNode("sub-topology 0", "KSTREAM-SOURCE-0000000000",
            "KSTREAM-TRANSFORM-0000000001", "KSTREAM-SINK-000000002", inputTopic.getName(),
            "count-resolved-repartition", "store 1");

    final TopologyNode interTopic = new TopicNode();
    interTopic.setName("count-resolved-repartition");
    interTopic.setType(TopologyNode.TypeEnum.TOPIC);

    final SubTopologyNode subTopologyNode1 =
        getSubTopologyNode("sub-topology 1", "KSTREAM-SOURCE-000000003",
            "KSTREAM-TRANSFORM-000000004", "KSTREAM-SINK-000000005", "count-resolved-repartition",
            "streams-count-resolved", "store 2");

    final TopologyGraph processorTopology = new TopologyGraph();
    Map<String, List<String>> processorAdjacency = new LinkedHashMap<>();
    processorAdjacency.put(subTopologyNode.getName(), List.of(interTopic.getName()));
    processorAdjacency.put(interTopic.getName(), List.of(subTopologyNode1.getName()));
    processorAdjacency.put(subTopologyNode1.getName(), List.of());

    Map<String, TopologyNode> processorNodes = new LinkedHashMap<>();
    processorNodes.put(subTopologyNode.getName(), subTopologyNode);
    processorNodes.put(interTopic.getName(), interTopic);
    processorNodes.put(subTopologyNode1.getName(), subTopologyNode1);

    processorTopology.setAdjacency(processorAdjacency);
    processorTopology.setNodes(processorNodes);

    topologyNode.setTopology(processorTopology);

    return globalTopology;
  }

  private static SubTopologyNode getSubTopologyNode(String subTopologyName, String sourceProcessor,
                                                    String transformProcessor, String sinkProcessor,
                                                    String sourceTopic, String sinkTopic,
                                                    String store) {
    final SubTopologyNode subTopologyNode = new SubTopologyNode();
    subTopologyNode.setName(subTopologyName);
    subTopologyNode.setType(TopologyNode.TypeEnum.SUB_TOPOLOGY);

    final TopologyGraph subTopology = new TopologyGraph();

    final SourceProcessorNode topology0Processor0 = new SourceProcessorNode();
    topology0Processor0.setName(sourceProcessor);
    topology0Processor0.setType(TopologyNode.TypeEnum.SOURCE_PROCESSOR);
    Optional.ofNullable(sourceTopic).ifPresent(topology0Processor0::addTopicsItem);

    final ProcessorNode topology0Processor1 = new ProcessorNode();
    topology0Processor1.setName(transformProcessor);
    topology0Processor1.setType(TopologyNode.TypeEnum.PROCESSOR);
    Optional.ofNullable(store).ifPresent(topology0Processor1::addStoresItem);

    final SinkProcessorNode topology0Processor2 = new SinkProcessorNode();
    topology0Processor2.setName(sinkProcessor);
    topology0Processor2.setType(TopologyNode.TypeEnum.SINK_PROCESSOR);
    topology0Processor2.setTopic(sinkTopic);

    final LinkedHashMap<String, List<String>> adjacency = new LinkedHashMap<>();
    adjacency.put(topology0Processor0.getName(), List.of(topology0Processor1.getName()));
    adjacency.put(topology0Processor1.getName(), List.of(topology0Processor2.getName()));
    adjacency.put(topology0Processor2.getName(), List.of());

    subTopology.setAdjacency(adjacency);

    Map<String, TopologyNode> nodes = new LinkedHashMap<>();
    nodes.put(topology0Processor0.getName(), topology0Processor0);
    nodes.put(topology0Processor1.getName(), topology0Processor1);
    nodes.put(topology0Processor2.getName(), topology0Processor2);

    subTopology.setNodes(nodes);
    subTopologyNode.setSubTopology(subTopology);
    return subTopologyNode;
  }
}
