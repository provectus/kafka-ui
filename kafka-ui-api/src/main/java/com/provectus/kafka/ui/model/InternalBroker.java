package com.provectus.kafka.ui.model;

import java.math.BigDecimal;
import javax.annotation.Nullable;
import lombok.Data;
import org.apache.kafka.common.Node;

@Data
public class InternalBroker {

  private final Integer id;
  private final String host;
  private final Integer port;
  private final @Nullable BigDecimal bytesInPerSec;
  private final @Nullable BigDecimal bytesOutPerSec;
  private final @Nullable Integer partitionsLeader;
  private final @Nullable Integer partitions;
  private final @Nullable Integer inSyncPartitions;
  private final @Nullable BigDecimal leadersSkew;
  private final @Nullable BigDecimal partitionsSkew;

  public InternalBroker(Node node,
                        PartitionDistributionStats partitionDistribution,
                        Metrics metrics) {
    this.id = node.id();
    this.host = node.host();
    this.port = node.port();
    this.bytesInPerSec = metrics.getIoRates().brokerBytesInPerSec().get(node.id());
    this.bytesOutPerSec = metrics.getIoRates().brokerBytesOutPerSec().get(node.id());
    this.partitionsLeader = partitionDistribution.getPartitionLeaders().get(node);
    this.partitions = partitionDistribution.getPartitionsCount().get(node);
    this.inSyncPartitions = partitionDistribution.getInSyncPartitions().get(node);
    this.leadersSkew = partitionDistribution.leadersSkew(node);
    this.partitionsSkew = partitionDistribution.partitionsSkew(node);
  }

}
