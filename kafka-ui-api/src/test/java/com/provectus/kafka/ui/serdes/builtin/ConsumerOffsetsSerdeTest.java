package com.provectus.kafka.ui.serdes.builtin;

import static com.provectus.kafka.ui.serdes.builtin.ConsumerOffsetsSerde.TOPIC;
import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.Serde;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.UUID;
import lombok.SneakyThrows;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.shaded.org.awaitility.Awaitility;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

class ConsumerOffsetsSerdeTest extends AbstractIntegrationTest {

  private static final int MSGS_TO_GENERATE = 10;

  private static String consumerGroupName;
  private static String committedTopic;

  @BeforeAll
  static void createTopicAndCommitItsOffset() {
    committedTopic = ConsumerOffsetsSerdeTest.class.getSimpleName() + "-" + UUID.randomUUID();
    consumerGroupName = committedTopic + "-group";
    createTopic(new NewTopic(committedTopic, 1, (short) 1));

    try (var producer = KafkaTestProducer.forKafka(kafka)) {
      for (int i = 0; i < MSGS_TO_GENERATE; i++) {
        producer.send(committedTopic, "i=" + i);
      }
    }
    try (var consumer = createConsumer(consumerGroupName)) {
      consumer.subscribe(List.of(committedTopic));
      int polled = 0;
      while (polled < MSGS_TO_GENERATE) {
        polled += consumer.poll(Duration.ofMillis(100)).count();
      }
      consumer.commitSync();
    }
  }

  @AfterAll
  static void cleanUp() {
    deleteTopic(committedTopic);
  }

  @Test
  void canOnlyDeserializeConsumerOffsetsTopic() {
    var serde = new ConsumerOffsetsSerde();
    assertThat(serde.canDeserialize(ConsumerOffsetsSerde.TOPIC, Serde.Target.KEY)).isTrue();
    assertThat(serde.canDeserialize(ConsumerOffsetsSerde.TOPIC, Serde.Target.VALUE)).isTrue();
    assertThat(serde.canDeserialize("anyOtherTopic", Serde.Target.KEY)).isFalse();
    assertThat(serde.canDeserialize("anyOtherTopic", Serde.Target.VALUE)).isFalse();
  }

  @Test
  void deserializesMessagesMadeByConsumerActivity() {
    var serde = new ConsumerOffsetsSerde();
    var keyDeserializer = serde.deserializer(TOPIC, Serde.Target.KEY);
    var valueDeserializer = serde.deserializer(TOPIC, Serde.Target.VALUE);

    try (var consumer = createConsumer(consumerGroupName + "-check")) {
      consumer.subscribe(List.of(ConsumerOffsetsSerde.TOPIC));
      List<Tuple2<DeserializeResult, DeserializeResult>> polled = new ArrayList<>();

      Awaitility.await()
          .pollInSameThread()
          .atMost(Duration.ofMinutes(1))
          .untilAsserted(() -> {
            for (var rec : consumer.poll(Duration.ofMillis(200))) {
              DeserializeResult key = rec.key() != null
                  ? keyDeserializer.deserialize(null, rec.key().get())
                  : null;
              DeserializeResult val = rec.value() != null
                  ? valueDeserializer.deserialize(null, rec.value().get())
                  : null;
              if (key != null && val != null) {
                polled.add(Tuples.of(key, val));
              }
            }
            assertThat(polled).anyMatch(t -> isCommitMessage(t.getT1(), t.getT2()));
            assertThat(polled).anyMatch(t -> isGroupMetadataMessage(t.getT1(), t.getT2()));
          });
    }
  }

  // Sample commit record:
  //
  // key: {
  //  "group": "test_Members_3",
  //  "topic": "test",
  //  "partition": 0
  // }
  //
  // value:
  // {
  //  "offset": 2,
  //  "leader_epoch": 0,
  //  "metadata": "",
  //  "commit_timestamp": 1683112980588
  // }
  private boolean isCommitMessage(DeserializeResult key, DeserializeResult value) {
    var keyJson = toMapFromJsom(key);
    boolean keyIsOk = consumerGroupName.equals(keyJson.get("group"))
        && committedTopic.equals(keyJson.get("topic"))
        && ((Integer) 0).equals(keyJson.get("partition"));

    var valueJson = toMapFromJsom(value);
    boolean valueIsOk = valueJson.containsKey("offset")
        && valueJson.get("offset").equals(MSGS_TO_GENERATE)
        && valueJson.containsKey("commit_timestamp");

    return keyIsOk && valueIsOk;
  }

  // Sample group metadata record:
  //
  // key: {
  //  "group": "test_Members_3"
  // }
  //
  // value:
  // {
  //  "protocol_type": "consumer",
  //  "generation": 1,
  //  "protocol": "range",
  //  "leader": "consumer-test_Members_3-1-5a37876e-e42f-420e-9c7d-6902889bd5dd",
  //  "current_state_timestamp": 1683112974561,
  //  "members": [
  //    {
  //      "member_id": "consumer-test_Members_3-1-5a37876e-e42f-420e-9c7d-6902889bd5dd",
  //      "group_instance_id": null,
  //      "client_id": "consumer-test_Members_3-1",
  //      "client_host": "/192.168.16.1",
  //      "rebalance_timeout": 300000,
  //      "session_timeout": 45000,
  //      "subscription": "AAEAAAABAAR0ZXN0/////wAAAAA=",
  //      "assignment": "AAEAAAABAAR0ZXN0AAAAAQAAAAD/////"
  //    }
  //  ]
  // }
  private boolean isGroupMetadataMessage(DeserializeResult key, DeserializeResult value) {
    var keyJson = toMapFromJsom(key);
    boolean keyIsOk = consumerGroupName.equals(keyJson.get("group")) && keyJson.size() == 1;

    var valueJson = toMapFromJsom(value);
    boolean valueIsOk = valueJson.keySet()
        .containsAll(Set.of("protocol_type", "generation", "leader", "members"));

    return keyIsOk && valueIsOk;
  }

  @SneakyThrows
  private Map<String, Object> toMapFromJsom(DeserializeResult result) {
    return new JsonMapper().readValue(result.getResult(), Map.class);
  }

  private static KafkaConsumer<Bytes, Bytes> createConsumer(String groupId) {
    Properties props = new Properties();
    props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
    props.put(ConsumerConfig.CLIENT_ID_CONFIG, groupId);
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
    props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    return new KafkaConsumer<>(props);
  }
}
