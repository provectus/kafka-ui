package com.provectus.kafka.ui;

import com.provectus.kafka.ui.model.ConsumerGroupDeleteResult;
import com.provectus.kafka.ui.model.ConsumerGroupIds;
import java.time.Duration;
import java.util.List;
import java.util.Properties;
import java.util.UUID;
import lombok.extern.log4j.Log4j2;
import lombok.val;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.utils.Bytes;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.HttpMethod;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@Log4j2
@AutoConfigureWebTestClient(timeout = "10000")
public class KakfaConsumerGroupTests extends AbstractBaseTest {
  @Autowired
  WebTestClient webTestClient;

  @Test
  void shouldReturnOkWithDeleteFalseWhenNoSuchConsumerGroupIds() {
    ConsumerGroupIds groupIds = new ConsumerGroupIds()
        .ids(List.of("groupA", "groupB"));

    String expError =
        "org.apache.kafka.common.errors.GroupIdNotFoundException: The group id does not exist.";
    List<ConsumerGroupDeleteResult> expectedResponse = List.of(
        new ConsumerGroupDeleteResult()
            .id("groupB")
            .deleted(false)
            .error(expError),
        new ConsumerGroupDeleteResult()
            .id("groupA")
            .deleted(false)
            .error(expError));

    deleteConsumerGroupAndAssert(groupIds, expectedResponse);
  }

  @Test
  void shouldDeleteConsumerGroupWhenNotActive() {
    String topicName = createTopicWithRandomName();

    //Create a consumer and subscribe to the topic
    String groupId = UUID.randomUUID().toString();
    val consumer = createTestConsumerWithGroupId(groupId);
    consumer.subscribe(List.of(topicName));
    consumer.poll(Duration.ofMillis(100));

    //Unsubscribe from all topics to be able to delete this consumer
    consumer.unsubscribe();

    //Delete the consumer when it's INACTIVE and check
    ConsumerGroupIds groupIds = new ConsumerGroupIds().ids(List.of(groupId));
    List<ConsumerGroupDeleteResult> expectedResponse = List.of(
        new ConsumerGroupDeleteResult()
            .id(groupId)
            .deleted(true));
    deleteConsumerGroupAndAssert(groupIds, expectedResponse);
  }

  @Test
  void shouldNotDeleteConsumerGroupWhenActive() {
    String topicName = createTopicWithRandomName();

    //Create a consumer and subscribe to the topic
    String groupId = UUID.randomUUID().toString();
    val consumer = createTestConsumerWithGroupId(groupId);
    consumer.subscribe(List.of(topicName));
    consumer.poll(Duration.ofMillis(100));

    //Try to delete the consumer when it's ACTIVE
    ConsumerGroupIds groupIds = new ConsumerGroupIds().ids(List.of(groupId));
    List<ConsumerGroupDeleteResult> expectedResponse = List.of(
        new ConsumerGroupDeleteResult()
            .id(groupId)
            .deleted(false)
            .error(
                "org.apache.kafka.common.errors.GroupNotEmptyException: The group is not empty."));
    deleteConsumerGroupAndAssert(groupIds, expectedResponse);
  }

  private String createTopicWithRandomName() {
    String topicName = UUID.randomUUID().toString();
    short replicationFactor = 1;
    int partitions = 1;
    createTopic(new NewTopic(topicName, partitions, replicationFactor));
    return topicName;
  }

  private KafkaConsumer<Bytes, Bytes> createTestConsumerWithGroupId(String groupId) {
    Properties props = new Properties();
    props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
    props.put(ConsumerConfig.CLIENT_ID_CONFIG, groupId);
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
    props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    return new KafkaConsumer<>(props);
  }

  @NotNull
  private WebTestClient.ListBodySpec<ConsumerGroupDeleteResult> deleteConsumerGroupAndAssert(
      ConsumerGroupIds groupIds, List<ConsumerGroupDeleteResult> expectedResponse) {
    return webTestClient
        .method(HttpMethod.DELETE)
        .uri("/api/clusters/{clusterName}/consumerGroups", LOCAL)
        .bodyValue(groupIds)
        .exchange()
        .expectStatus()
        .isOk()
        .expectBodyList(ConsumerGroupDeleteResult.class)
        .value(actualResponse -> Assertions.assertEquals(expectedResponse, actualResponse));
  }
}
