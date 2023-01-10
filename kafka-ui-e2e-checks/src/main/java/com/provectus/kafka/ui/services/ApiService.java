package com.provectus.kafka.ui.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.api.ApiClient;
import com.provectus.kafka.ui.api.api.KafkaConnectApi;
import com.provectus.kafka.ui.api.api.MessagesApi;
import com.provectus.kafka.ui.api.api.SchemasApi;
import com.provectus.kafka.ui.api.api.TopicsApi;
import com.provectus.kafka.ui.api.model.CreateTopicMessage;
import com.provectus.kafka.ui.api.model.NewConnector;
import com.provectus.kafka.ui.api.model.NewSchemaSubject;
import com.provectus.kafka.ui.api.model.TopicCreation;
import com.provectus.kafka.ui.models.Connector;
import com.provectus.kafka.ui.models.Schema;
import com.provectus.kafka.ui.models.Topic;
import java.util.HashMap;
import java.util.Map;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.reactive.function.client.WebClientResponseException;


@Slf4j
public class ApiService extends BaseSource {

    int partitions = 1;
    int replicationFactor = 1;
    String baseURL = BaseSource.BASE_API_URL;


    @SneakyThrows
    private TopicsApi topicApi() {
      return new TopicsApi(new ApiClient().setBasePath(BASE_LOCAL_URL));
    }

    @SneakyThrows
    private SchemasApi schemaApi() {
      return new SchemasApi(new ApiClient().setBasePath(BASE_LOCAL_URL));
    }

    @SneakyThrows
    private KafkaConnectApi connectorApi() {
      return new KafkaConnectApi(new ApiClient().setBasePath(BASE_LOCAL_URL));
    }

    @SneakyThrows
    private MessagesApi messageApi() {
      return new MessagesApi(new ApiClient().setBasePath(BASE_LOCAL_URL));
    }

    @SneakyThrows
    public void createTopic(String clusterName, String topicName) {
      TopicCreation topic = new TopicCreation();
      topic.setName(topicName);
      topic.setPartitions(1);
      topic.setReplicationFactor(1);
      try {
        topicApi().createTopic(clusterName, topic).block();
        sleep(2000);
      } catch (WebClientResponseException ex) {
        ex.printStackTrace();
      }
    }

    public void createTopic(String topicName) {
      createTopic(CLUSTER_NAME, topicName);
    }

    public void deleteTopic(String clusterName, String topicName) {
        try {
            topicApi().deleteTopic(clusterName, topicName).block();
        } catch (WebClientResponseException ignore) {
        }
    }

    public void deleteTopic(String topicName){
      deleteTopic(CLUSTER_NAME, topicName);
    }

    @SneakyThrows
    public void createSchema(String clusterName, Schema schema) {
        NewSchemaSubject schemaSubject = new NewSchemaSubject();
        schemaSubject.setSubject(schema.getName());
        schemaSubject.setSchema(fileToString(schema.getValuePath()));
        schemaSubject.setSchemaType(schema.getType());
        try {
            schemaApi().createNewSchema(clusterName, schemaSubject).block();
        } catch (WebClientResponseException ex) {
            ex.printStackTrace();
        }
    }

    public void createSchema(Schema schema){
      createSchema(CLUSTER_NAME, schema);
    }

    @SneakyThrows
    public void deleteSchema(String clusterName, String schemaName) {
        try {
            schemaApi().deleteSchema(clusterName, schemaName).block();
        } catch (WebClientResponseException ignore) {
        }
    }

    public void deleteSchema(String schemaName){
      deleteSchema(CLUSTER_NAME, schemaName);
    }

    @SneakyThrows
    public void deleteConnector(String clusterName, String connectName, String connectorName) {
        try {
            connectorApi().deleteConnector(clusterName, connectName, connectorName).block();
        } catch (WebClientResponseException ignore) {
        }
    }

    @SneakyThrows
    public void createConnector(String clusterName, String connectName, Connector connector) {
        NewConnector connectorProperties = new NewConnector();
        connectorProperties.setName(connector.getName());
        Map<String, Object> configMap = new ObjectMapper().readValue(connector.getConfig(), HashMap.class);
        connectorProperties.setConfig(configMap);
        try {
            connectorApi().deleteConnector(clusterName, connectName, connector.getName()).block();
        } catch (WebClientResponseException ignored) {
        }
        connectorApi().createConnector(clusterName, connectName, connectorProperties).block();
    }

    public String getFirstConnectName(String clusterName) {
        return connectorApi().getConnects(clusterName).blockFirst().getName();
    }

    @SneakyThrows
    public void sendMessage(String clusterName, Topic topic) {
      CreateTopicMessage createMessage = new CreateTopicMessage();
      createMessage.setPartition(0);
      createMessage.setKeySerde("String");
      createMessage.setValueSerde("String");
      createMessage.setKey(topic.getMessageKey());
      createMessage.setContent(topic.getMessageContent());
      try {
        messageApi().sendTopicMessages(clusterName, topic.getName(), createMessage).block();
      } catch (WebClientResponseException ex) {
        ex.getRawStatusCode();
      }
    }

    public void sendMessage(Topic topic) {
      sendMessage(CLUSTER_NAME, topic);
    }
}
