package com.provectus.kafka.ui;

import com.provectus.kafka.ui.cluster.config.ClustersProperties;
import com.provectus.kafka.ui.cluster.mapper.ClusterMapper;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.Topic;
import com.provectus.kafka.ui.model.TopicConfig;
import com.provectus.kafka.ui.model.TopicFormData;
import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.KafkaContainer;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient(timeout = "10000000")
public class UpdateTopicTest {

    TopicFormData topicFormData = new TopicFormData();

    private String API_CLUSTERS_URL = "http://localhost:8080/api/clusters";

    private String URL_TEMPLATE_UPDATE = API_CLUSTERS_URL + "/%s/topics/%s";
    private String URL_TEMPLATE_CREATE = API_CLUSTERS_URL + "/%s/topics";
    private String URL_TEMPLATE_GET_SETTINGS = API_CLUSTERS_URL + "/%s/topics/%s/config";
    private String PARAM_TO_CHANGE_KEY = "segment.index.bytes";
    private String PARAM_TO_CHANGE_VALUE = "10485761";

    private final String CLUSTER_NAME = "local";
    private final String TOPIC_NAME = "messages1";

    private String urlUpdate;
    private String urlSettings;
    private String urlCreate;

    @Autowired
    private WebTestClient webTestClient;

    @SpyBean
    private ClustersStorage clustersStorage;

    private KafkaCluster kafkaCluster;
    private Mono<TopicFormData> topicFormDataMono;
    private Mono<TopicFormData> topicFormDataCreateMono;

    @ClassRule
    public static KafkaContainer kafka = new KafkaContainer();

    @ClassRule
    public static GenericContainer zk = new GenericContainer("confluentinc/cp-zookeeper:5.1.0");

    @Before
    public void prepareParams () {
        urlUpdate = String.format(URL_TEMPLATE_UPDATE, CLUSTER_NAME, TOPIC_NAME);
        urlSettings = String.format(URL_TEMPLATE_GET_SETTINGS, CLUSTER_NAME, TOPIC_NAME);
        urlCreate = String.format(URL_TEMPLATE_CREATE, CLUSTER_NAME);

        prepareClusterForTest();
        startTestEnvironment();
        prepareTopicParams();
    }

    @Test
    public void test() {
        try {
            webTestClient.post().uri(urlCreate).accept(MediaType.APPLICATION_JSON).body(topicFormDataCreateMono, TopicFormData.class)
                    .exchange().returnResult(Topic.class).getResponseBody().blockLast();
            webTestClient.put().uri(urlUpdate).accept(MediaType.APPLICATION_JSON).body(topicFormDataMono, TopicFormData.class)
                    .exchange().returnResult(Topic.class).getResponseBody().blockLast();
            Assert.assertEquals(webTestClient.get().uri(urlSettings).accept(MediaType.APPLICATION_JSON).exchange().returnResult(TopicConfig.class)
                            .getResponseBody()
                            .filter(s4 -> s4.getName().equals(PARAM_TO_CHANGE_KEY)).blockLast().getValue(), PARAM_TO_CHANGE_VALUE);
        } finally {
            kafka.close();
        }
    }

    private void prepareClusterForTest() {
        final ClusterMapper clusterMapper = Mappers.getMapper(ClusterMapper.class);
        clustersStorage.init();
        ClustersProperties.Cluster cluster = new ClustersProperties.Cluster();
        cluster.setName(CLUSTER_NAME);
        cluster.setBootstrapServers(kafka.getBootstrapServers());
        cluster.setZookeeper("localhost:2181");
        kafkaCluster = clusterMapper.toKafkaCluster(cluster);
        Map<String, KafkaCluster> clusterMap = new HashMap<>();
        clusterMap.put(CLUSTER_NAME, kafkaCluster);
        ReflectionTestUtils.setField(clustersStorage, "kafkaClusters", clusterMap);
    }

    private void startTestEnvironment() {
         zk
                .withNetwork(kafka.getNetwork())
                .withNetworkAliases("zookeeper")
                .withEnv("ZOOKEEPER_CLIENT_PORT", "2181");
         kafka.withExternalZookeeper("zookeeper:2181");
        kafka.start();
    }

    private void prepareTopicParams() {
        Map<String, String> configs = new HashMap<>();
        configs.put("cleanup.policy", "delete");
        configs.put("min.insync.replicas", "1");
        configs.put("retention.bytes", "-1");
        configs.put("retention.ms", "604800000");
        configs.put(PARAM_TO_CHANGE_KEY, PARAM_TO_CHANGE_VALUE);

        topicFormData.setName(TOPIC_NAME);
        topicFormData.setPartitions(3);
        topicFormData.setReplicationFactor(1);
        topicFormData.setConfigs(configs);
        topicFormDataMono = Mono.just(topicFormData);

        topicFormDataCreateMono = Mono.just(topicFormData);
    }
}
