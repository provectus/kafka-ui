package com.provectus.kafka.ui.service.reassign;

import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.util.Map;
import java.util.Optional;
import org.apache.kafka.clients.admin.NewPartitionReassignment;
import org.apache.kafka.common.TopicPartition;

public record ReassignmentPlan(Map<TopicPartition, Optional<NewPartitionReassignment>> reassignments) {

}
