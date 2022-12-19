package com.provectus.kafka.ui.service.reassign;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.google.common.collect.Lists;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.random.RandomGenerator;
import java.util.stream.IntStream;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.TopicPartition;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.shaded.org.awaitility.Awaitility;
import org.testcontainers.utility.DockerImageName;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

class ReassignmentOperationsTest {

  private static final String CONFLUENTINC_VERSION = "7.3.0";

  private static final int KAFKA_1_ID = 1;
  private static final int KAFKA_2_ID = 2;

  private static final Network NETWORK = Network.newNetwork();
  private static GenericContainer<?> ZK;
  private static KafkaContainer KAFKA_1;
  private static KafkaContainer KAFKA_2;

  private static AdminClient ADMIN_CLIENT;

  ReassignmentOperations ops = new ReassignmentOperations(ReactiveAdminClient.create(ADMIN_CLIENT).block());

  @BeforeAll
  static void init() {
    ZK = new GenericContainer(
        DockerImageName.parse("confluentinc/cp-zookeeper").withTag(CONFLUENTINC_VERSION))
        .withEnv("ZOOKEEPER_CLIENT_PORT", "2181")
        .withNetworkAliases("zookeeper")
        .withNetwork(NETWORK);
    KAFKA_1 = new KafkaContainer(
        DockerImageName.parse("confluentinc/cp-kafka").withTag(CONFLUENTINC_VERSION))
        .withNetwork(NETWORK)
        .withEnv("KAFKA_BROKER_ID", KAFKA_1_ID + "")
        .withExternalZookeeper("zookeeper:2181");
    KAFKA_2 = new KafkaContainer(
        DockerImageName.parse("confluentinc/cp-kafka").withTag(CONFLUENTINC_VERSION))
        .withNetwork(NETWORK)
        .withEnv("KAFKA_BROKER_ID", KAFKA_2_ID + "")
        .withExternalZookeeper("zookeeper:2181");

    ZK.start();
    KAFKA_1.start();
    KAFKA_2.start();

    Properties p = new Properties();
    p.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, KAFKA_1.getBootstrapServers());
    ADMIN_CLIENT = AdminClient.create(p);
  }

  @AfterAll
  static void tearDown() {
    ADMIN_CLIENT.close();
    KAFKA_1.stop();
    KAFKA_2.stop();
    ZK.stop();
    NETWORK.close();
  }

  @Test
  void testGeneratePartitionReassignment() throws Exception {
    String testTopic1 = "test_" + UUID.randomUUID();
    String testTopic2 = "test_" + UUID.randomUUID();
    ADMIN_CLIENT.createTopics(
        List.of(
            new NewTopic(testTopic1, 5, (short) 1),
            new NewTopic(testTopic2, 3, (short) 2))
    ).all().get();

    Map<TopicPartition, List<Integer>> assignment =
        ops.generatePartitionReassignment(
            Set.of(testTopic1, testTopic2), List.of(KAFKA_1_ID, KAFKA_2_ID), false).block();

    var perTopicAssignments = assignment.entrySet().stream()
        .collect(groupingBy(e -> e.getKey().topic(), toMap(Map.Entry::getKey, Map.Entry::getValue)));

    verifyAssignment(testTopic1, 5, 1, perTopicAssignments.get(testTopic1));
    verifyAssignment(testTopic2, 3, 2, perTopicAssignments.get(testTopic2));
  }

  @Test
  void testGetCurrentAssignment() throws Exception {
    String testTopic1 = "test_" + UUID.randomUUID();
    String testTopic2 = "test_" + UUID.randomUUID();
    ADMIN_CLIENT.createTopics(
        List.of(
            new NewTopic(testTopic1, 2, (short) 2),
            new NewTopic(testTopic2, 2, (short) 2))
    ).all().get();

    Map<TopicPartition, List<Integer>> currentAssignment =
        ops.getCurrentAssignment(Set.of(testTopic1, testTopic2)).block();

    assertThat(currentAssignment.entrySet().stream())
        .hasSize(4)
        .allSatisfy(e -> {
          TopicPartition partition = e.getKey();
          List<Integer> replicas = e.getValue();
          assertThat(partition.topic()).isIn(List.of(testTopic1, testTopic2));
          assertThat(replicas).hasSize(2).containsExactlyInAnyOrder(KAFKA_1_ID, KAFKA_2_ID);
        });
  }

  @Test
  void testValidateAndExecute() throws Exception {
    String testTopic1 = "test_" + UUID.randomUUID();
    String testTopic2 = "test_" + UUID.randomUUID();
    ADMIN_CLIENT.createTopics(
        List.of(
            new NewTopic(testTopic1, 2, (short) 2),
            new NewTopic(testTopic2, 2, (short) 2))
    ).all().get();

    Map<TopicPartition, List<Integer>> currentAssignment =
        ops.getCurrentAssignment(Set.of(testTopic1, testTopic2)).block();

    Map<TopicPartition, List<Integer>> desiredAssignment = currentAssignment.entrySet().stream()
        .map(e -> Tuples.of(e.getKey(), Lists.reverse(e.getValue()))) //reversing replicas list
        .collect(toMap(Tuple2::getT1, Tuple2::getT2));

    ops.validateAndExecute(
        desiredAssignment.entrySet().stream().map(e -> Tuples.of(e.getKey(), e.getValue())).toList(), () -> {}).block();

    Awaitility.await()
        .pollInSameThread()
        .atMost(Duration.ofSeconds(10))
        .untilAsserted(() -> {
          Map<TopicPartition, List<Integer>> actualAssignment =
              ops.getCurrentAssignment(Set.of(testTopic1, testTopic2)).block();

          assertThat(actualAssignment).containsExactlyInAnyOrderEntriesOf(desiredAssignment);
        });
  }

  //test case copied from https://github.com/apache/kafka/blob/99b9b3e84f4e98c3f07714e1de6a139a004cbc5b/core/src/test/scala/unit/kafka/admin/AdminRackAwareTest.scala#L198
  @Test
  void testAssignReplicasToBrokersRackUnaware() {
    RandomGenerator rand = mock(RandomGenerator.class);
    when(rand.nextInt(anyInt())).thenReturn(0);

    var assignment = ReassignmentOperations.assignReplicasToBrokersRackUnaware(
        "test",
        10,
        3,
        List.of(0, 1, 2, 3, 4),
        rand
    );
    assertThat(assignment)
        .containsExactlyInAnyOrderEntriesOf(
            Map.of(
                new TopicPartition("test", 0), List.of(0, 1, 2),
                new TopicPartition("test", 1), List.of(1, 2, 3),
                new TopicPartition("test", 2), List.of(2, 3, 4),
                new TopicPartition("test", 3), List.of(3, 4, 0),
                new TopicPartition("test", 4), List.of(4, 0, 1),
                new TopicPartition("test", 5), List.of(0, 2, 3),
                new TopicPartition("test", 6), List.of(1, 3, 4),
                new TopicPartition("test", 7), List.of(2, 4, 0),
                new TopicPartition("test", 8), List.of(3, 0, 1),
                new TopicPartition("test", 9), List.of(4, 1, 2)
            )
        );
  }

  @ParameterizedTest
  @CsvSource({
      "10, 3, 1",
      "10, 3, 3",
      "1, 10, 1",
      "1, 10, 10",
  })
  void testAssignReplicasToBrokersRackUnawareWithRealRandom(int partitions, int brokersCnt, int replicationF) {
    var assignment = ReassignmentOperations.assignReplicasToBrokersRackUnaware(
        "test",
        partitions,
        replicationF,
        IntStream.range(0, brokersCnt).boxed().toList(),
        ThreadLocalRandom.current()
    );
    verifyAssignment("test", partitions, replicationF, assignment);
  }

  private void verifyAssignment(String topic, int numParts, int replicationFactor,
                                Map<TopicPartition, List<Integer>> assignmentToCheck) {
    assertThat(assignmentToCheck.keySet())
        .containsExactlyInAnyOrderElementsOf(
            IntStream.range(0, numParts).mapToObj(i -> new TopicPartition(topic, i)).toList());

    assertThat(assignmentToCheck.values().stream())
        .allMatch(replicas ->
            replicas.stream().distinct().count() == replicas.size() && replicas.size() == replicationFactor);
  }

}
