package com.provectus.kafka.ui.services;

import static com.codeborne.selenide.Selenide.sleep;
import static com.provectus.kafka.ui.utilities.FileUtils.fileToString;

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
import com.provectus.kafka.ui.settings.BaseSource;
import io.qameta.allure.Step;
import java.util.HashMap;
import java.util.Map;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.reactive.function.client.WebClientResponseException;


@Slf4j
public class ApiService extends BaseSource {

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
    private void createTopic(String clusterName, String topicName) {
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

    @Step
    public ApiService createTopic(String topicName) {
      createTopic(CLUSTER_NAME, topicName);
      return this;
    }

    @SneakyThrows
    private void deleteTopic(String clusterName, String topicName) {
        try {
            topicApi().deleteTopic(clusterName, topicName).block();
        } catch (WebClientResponseException ignore) {
        }
    }

    @Step
    public ApiService deleteTopic(String topicName){
      deleteTopic(CLUSTER_NAME, topicName);
      return this;
    }

    @SneakyThrows
    private void createSchema(String clusterName, Schema schema) {
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

    @Step
    public ApiService createSchema(Schema schema){
      createSchema(CLUSTER_NAME, schema);
      return this;
    }

    @SneakyThrows
    private void deleteSchema(String clusterName, String schemaName) {
        try {
            schemaApi().deleteSchema(clusterName, schemaName).block();
        } catch (WebClientResponseException ignore) {
        }
    }

    @Step
    public ApiService deleteSchema(String schemaName){
      deleteSchema(CLUSTER_NAME, schemaName);
      return this;
    }

    @SneakyThrows
    private void deleteConnector(String clusterName, String connectName, String connectorName) {
        try {
            connectorApi().deleteConnector(clusterName, connectName, connectorName).block();
        } catch (WebClientResponseException ignore) {
        }
    }

    @Step
    public ApiService deleteConnector(String connectName, String connectorName){
      deleteConnector(CLUSTER_NAME, connectName, connectorName);
      return this;
    }

    @SneakyThrows
    private void createConnector(String clusterName, String connectName, Connector connector) {
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

    @Step
    public ApiService createConnector(String connectName, Connector connector){
      createConnector(CLUSTER_NAME, connectName, connector);
      return this;
    }

    @Step
    public String getFirstConnectName(String clusterName) {
        return connectorApi().getConnects(clusterName).blockFirst().getName();
    }

    @SneakyThrows
    private void sendMessage(String clusterName, Topic topic) {
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

    @Step
    public ApiService sendMessage(Topic topic) {
      sendMessage(CLUSTER_NAME, topic);
      return this;
    }
}
