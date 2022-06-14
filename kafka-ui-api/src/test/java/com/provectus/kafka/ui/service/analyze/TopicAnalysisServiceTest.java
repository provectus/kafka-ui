package com.provectus.kafka.ui.service.analyze;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import com.provectus.kafka.ui.service.ClustersStorage;
import java.time.Duration;
import java.util.UUID;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.testcontainers.shaded.org.awaitility.Awaitility;


class TopicAnalysisServiceTest extends AbstractIntegrationTest {

  @Autowired
  private ClustersStorage clustersStorage;

  @Autowired
  private TopicAnalysisService topicAnalysisService;

  @Test
  void savesResultWhenAnalysisIsCompleted() {
    String topic = "analyze_test_" + UUID.randomUUID();
    createTopic(new NewTopic(topic, 2, (short) 1));
    fillTopic(topic, 1_000);

    var cluster = clustersStorage.getClusterByName(LOCAL).get();
    topicAnalysisService.analyze(cluster, topic).block();

    Awaitility.await()
        .atMost(Duration.ofSeconds(20))
        .untilAsserted(() -> {
          assertThat(topicAnalysisService.getTopicAnalysis(cluster, topic))
              .hasValueSatisfying(state -> {
                assertThat(state.getProgress()).isNull();
                assertThat(state.getResult()).isNotNull();
                var completedAnalyze = state.getResult();
                assertThat(completedAnalyze.getTotalStats().getTotalMsgs()).isEqualTo(1_000);
                assertThat(completedAnalyze.getPartitionStats().size()).isEqualTo(2);
              });
        });
  }

  private void fillTopic(String topic, int cnt) {
    try (var producer = KafkaTestProducer.forKafka(kafka)) {
      for (int i = 0; i < cnt; i++) {
        producer.send(
            new ProducerRecord<>(
                topic,
                RandomStringUtils.randomAlphabetic(5),
                RandomStringUtils.randomAlphabetic(10)));
      }
    }
  }


}