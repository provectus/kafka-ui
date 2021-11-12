package com.provectus.kafka.ui.model;

import java.util.Collection;
import java.util.List;
import lombok.Data;
import org.apache.kafka.clients.admin.TopicDescription;

@Data
public class PartitionsStats {

  private int partitionsCount;
  private int replicasCount;
  private int onlinePartitionCount;
  private int offlinePartitionCount;
  private int inSyncReplicasCount;
  private int outOfSyncReplicasCount;
  private int underReplicatedPartitionCount;

  public PartitionsStats(TopicDescription description) {
    this(List.of(description));
  }

  public PartitionsStats(Collection<TopicDescription> topicDescriptions) {
    topicDescriptions.stream()
        .flatMap(t -> t.partitions().stream())
        .forEach(p -> {
          partitionsCount++;
          replicasCount += p.replicas().size();
          onlinePartitionCount += p.leader() != null ? 1 : 0;
          offlinePartitionCount += p.leader() == null ? 1 : 0;
          inSyncReplicasCount += p.isr().size();
          outOfSyncReplicasCount += (p.replicas().size() - p.isr().size());
          if (p.replicas().size() > p.isr().size()) {
            underReplicatedPartitionCount++;
          }
        });
  }
}
