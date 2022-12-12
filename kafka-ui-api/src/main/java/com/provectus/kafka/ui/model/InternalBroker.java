package com.provectus.kafka.ui.model;

import java.math.BigDecimal;
import lombok.Data;
import org.apache.kafka.common.Node;

@Data
public class InternalBroker {

  private final Integer id;
  private final String host;
  private final Integer port;
  private final BigDecimal bytesInPerSec;
  private final BigDecimal bytesOutPerSec;

  public InternalBroker(Node node, Statistics statistics) {
    this.id = node.id();
    this.host = node.host();
    this.port = node.port();
    this.bytesInPerSec = statistics.getMetrics().getBrokerBytesInPerSec().get(node.id());
    this.bytesOutPerSec = statistics.getMetrics().getBrokerBytesOutPerSec().get(node.id());
  }

}
