package com.provectus.kafka.ui.service.reassign;

import com.provectus.kafka.ui.model.InProgressPartitionReassignmentDTO;
import com.provectus.kafka.ui.model.InProgressReassignmentDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.PartitionReassignmentDTO;
import com.provectus.kafka.ui.model.ReassignPartitionsCommandDTO;
import com.provectus.kafka.ui.service.AdminClientService;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.PartitionReassignment;
import org.apache.kafka.common.TopicPartition;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ReassignmentService {

  private final AdminClientService adminClientService;

  public Mono<ReassignPartitionsCommandDTO> generate(KafkaCluster cluster,
                                                     Set<String> topics,
                                                     List<Integer> brokerIds) {
    return adminClientService.get(cluster)
        .map(ReassignmentPlanner::new)
        .flatMap(planner -> planner.generatePartitionReassignment(topics, brokerIds, false));
  }


  public Mono<ReassignPartitionsCommandDTO> getCurrentAssignment(KafkaCluster cluster,
                                                                 Set<String> topics) {
    return adminClientService.get(cluster)
        .flatMap(ac -> ReassignmentPlanner.currentAssignments(ac, topics))
        .map(this::map);
  }

  public Mono<InProgressReassignmentDTO> getInProgressAssignments(KafkaCluster cluster) {
    return adminClientService.get(cluster)
        .flatMap(ReactiveAdminClient::listPartitionReassignments)
        .map(this::mapInProgressReassignments);
  }

  private InProgressReassignmentDTO mapInProgressReassignments(Map<TopicPartition, PartitionReassignment> reassignments) {
    return new InProgressReassignmentDTO()
        .partitions(
            reassignments.entrySet().stream()
                .map(e -> new InProgressPartitionReassignmentDTO()
                    .topic(e.getKey().topic())
                    .partition(e.getKey().partition())
                    .currentReplicas(e.getValue().replicas())
                    .addingReplicas(e.getValue().addingReplicas())
                    .removingReplicas(e.getValue().removingReplicas())
                )
                .toList()
        );
  }

  private ReassignPartitionsCommandDTO map(Map<String, Map<TopicPartition, List<Integer>>> assignment) {
     return new ReassignPartitionsCommandDTO()
        .version(1)
        .partitions(
            assignment.values().stream()
                .flatMap(m -> m.entrySet().stream())
                .map(p -> new PartitionReassignmentDTO()
                    .topic(p.getKey().topic())
                    .partition(p.getKey().partition())
                    .replicas(p.getValue())
                    .logDirs(p.getValue().stream().map(r -> "any").toList())
                )
                .toList()
        );
  }

}
