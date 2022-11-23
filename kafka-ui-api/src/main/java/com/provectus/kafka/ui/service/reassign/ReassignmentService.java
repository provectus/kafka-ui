package com.provectus.kafka.ui.service.reassign;

import static com.provectus.kafka.ui.service.reassign.ReassignmentOperations.LOG_DIR_NOT_SET_STRING;
import static com.provectus.kafka.ui.service.reassign.ReassignmentOperations.SUPPORTED_CMD_VERSION;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.provectus.kafka.ui.exception.ValidationException;
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
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.PartitionReassignment;
import org.apache.kafka.common.TopicPartition;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReassignmentService {

  private final AdminClientService adminClientService;

  public Mono<ReassignPartitionsCommandDTO> generate(KafkaCluster cluster,
                                                     Set<String> topics,
                                                     List<Integer> brokerIds) {
    return adminClientService.get(cluster)
        .map(ReassignmentOperations::new)
        .flatMap(planner -> planner.generatePartitionReassignment(topics, brokerIds, false))
        .map(ReassignmentService::mapToReassignmentDto);
  }

  public Mono<Void> executeReassignment(KafkaCluster cluster, ReassignPartitionsCommandDTO cmd) {
    return adminClientService.get(cluster)
        .map(ReassignmentOperations::new)
        .flatMap(ops -> {
          if (!cmd.getPartitions().stream()
              .flatMap(p -> p.getLogDirs().stream())
              .allMatch(logDir -> logDir.equalsIgnoreCase(LOG_DIR_NOT_SET_STRING))) {
            return Mono.error(new ValidationException("Log dir altering is not supported"));
          }
          List<Tuple2<TopicPartition, List<Integer>>> reassignment = cmd.getPartitions().stream()
              .map(p -> Tuples.of(new TopicPartition(p.getTopic(), p.getPartition()), p.getReplicas()))
              .toList();
          return ops.validateAndExecute(reassignment, () -> logRequestedAssignment(cmd));
        });
  }

  @SneakyThrows
  private void logRequestedAssignment(ReassignPartitionsCommandDTO cmd) {
    log.info("Executing partitions reassignment: \n{}",
        new JsonMapper().writerWithDefaultPrettyPrinter().writeValueAsString(cmd));
  }

  public Mono<Void> cancelReassignment(KafkaCluster cluster, Set<TopicPartition> partitions) {
    return adminClientService.get(cluster)
        .map(ReassignmentOperations::new)
        .flatMap(ops -> ops.cancelReassignment(partitions));
  }

  public Mono<ReassignPartitionsCommandDTO> getCurrentAssignment(KafkaCluster cluster,
                                                                 Set<String> topics) {
    return adminClientService.get(cluster)
        .map(ReassignmentOperations::new)
        .flatMap(ops -> ops.getCurrentAssignment(topics))
        .map(ReassignmentService::mapToReassignmentDto);
  }

  public Mono<InProgressReassignmentDTO> getInProgressAssignments(KafkaCluster cluster) {
    return adminClientService.get(cluster)
        .flatMap(ReactiveAdminClient::listPartitionReassignments)
        .map(ReassignmentService::mapToInProgressReassignmentsDto);
  }

  private static InProgressReassignmentDTO mapToInProgressReassignmentsDto(
      Map<TopicPartition, PartitionReassignment> reassignments) {
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

  private static ReassignPartitionsCommandDTO mapToReassignmentDto(
      Map<TopicPartition, List<Integer>> assignment) {
    return new ReassignPartitionsCommandDTO()
        .version(SUPPORTED_CMD_VERSION)
        .partitions(assignment.entrySet().stream().map(ReassignmentService::mapPartitionAssignmentDto).toList());
  }

  private static PartitionReassignmentDTO mapPartitionAssignmentDto(Map.Entry<TopicPartition, List<Integer>>
                                                                     partitionsAssignment) {
    return new PartitionReassignmentDTO()
        .topic(partitionsAssignment.getKey().topic())
        .partition(partitionsAssignment.getKey().partition())
        .replicas(partitionsAssignment.getValue())
        .logDirs(partitionsAssignment.getValue().stream().map(r -> LOG_DIR_NOT_SET_STRING).toList());
  }

}
