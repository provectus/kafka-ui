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

    final TopologyNode sourceTopic = new TopicNode();
    sourceTopic.setName("conversation-meta");
    sourceTopic.setType(TopologyNode.TypeEnum.TOPIC);

    final ProcessorTopologyNode topologyNode = new ProcessorTopologyNode();
    topologyNode.setName("topology 1");
    topologyNode.setType(TopologyNode.TypeEnum.PROCESSOR_TOPOLOGY);

    final TopologyNode sinkTopic = new TopicNode();
    sinkTopic.setName("streams-count-resolved");
    sinkTopic.setType(TopologyNode.TypeEnum.TOPIC);

    final TopologyNode sinkConnector = new ProcessorTopologyNode();
    sinkConnector.setName("sink connector");
    sinkConnector.setType(TopologyNode.TypeEnum.SINK_CONNECTOR);

    topology.setAdjacency(
        new LinkedHashMap<>() {{
          put(sourceConnector.getName(), List.of(sourceTopic.getName()));
          put(sourceTopic.getName(), List.of(topologyNode.getName()));
          put(topologyNode.getName(), List.of(sinkTopic.getName()));
          put(sinkTopic.getName(), List.of(sinkConnector.getName()));
          put(sinkConnector.getName(), List.of());
        }}
    );
    topology
        .setNodes(List.of(sourceConnector, sourceTopic, topologyNode, sinkTopic, sinkConnector));

    final SubTopologyNode subTopologyNode =
        getSubTopologyNode("sub-topology 0", "KSTREAM-SOURCE-0000000000",
            "KSTREAM-TRANSFORM-0000000001", "KSTREAM-SINK-000000002", "conversation-meta",
            "count-resolved-repartition");

    final TopologyNode interTopic = new TopicNode();
    interTopic.setName("count-resolved-repartition");
    interTopic.setType(TopologyNode.TypeEnum.TOPIC);

    final SubTopologyNode subTopologyNode1 =
        getSubTopologyNode("sub-topology 1", "KSTREAM-SOURCE-000000003",
            "KSTREAM-TRANSFORM-000000004", "KSTREAM-SINK-000000005", "count-resolved-repartition",
            "streams-count-resolved");

    topologyNode.setTopology(List.of(subTopologyNode, interTopic, subTopologyNode1));

    return globalTopology;
  }

  private static SubTopologyNode getSubTopologyNode(String subTopologyName, String sourceProcessor,
                                                    String transformProcessor, String sinkProcessor,
                                                    String sourceTopic, String sinkTopic) {
    final SubTopologyNode subTopologyNode = new SubTopologyNode();
    subTopologyNode.setName(subTopologyName);
    subTopologyNode.setType(TopologyNode.TypeEnum.SUB_TOPOLOGY);

    final TopologyGraph subTopology = new TopologyGraph();

    final SourceProcessorNode topology0Processor0 = new SourceProcessorNode();
    topology0Processor0.setName(sourceProcessor);
    topology0Processor0.setType(TopologyNode.TypeEnum.SOURCE_PROCESSOR);
    topology0Processor0.addTopicsItem(sourceTopic);

    final ProcessorNode topology0Processor1 = new ProcessorNode();
    topology0Processor1.setName(transformProcessor);
    topology0Processor1.setType(TopologyNode.TypeEnum.PROCESSOR);
    topology0Processor1.addStoresItem("store");

    final SinkProcessorNode topology0Processor2 = new SinkProcessorNode();
    topology0Processor2.setName(sinkProcessor);
    topology0Processor2.setType(TopologyNode.TypeEnum.SINK_PROCESSOR);
    topology0Processor2.setTopic(sinkTopic);

    subTopology.setAdjacency(
        new LinkedHashMap<>() {{
          put(topology0Processor0.getName(), List.of(topology0Processor1.getName()));
          put(topology0Processor1.getName(), List.of(topology0Processor2.getName()));
          put(topology0Processor2.getName(), List.of());
        }}

    );
    subTopology.setNodes(List.of(topology0Processor0, topology0Processor1, topology0Processor2));
    subTopologyNode.setSubTopology(subTopology);
    return subTopologyNode;
  }
}
