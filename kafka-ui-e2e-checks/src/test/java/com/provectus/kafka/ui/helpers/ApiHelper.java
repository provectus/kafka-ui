package com.provectus.kafka.ui.helpers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.api.api.MessagesApi;
import lombok.SneakyThrows;

import com.provectus.kafka.ui.api.*;
import com.provectus.kafka.ui.api.model.*;
import com.provectus.kafka.ui.api.api.TopicsApi;
import com.provectus.kafka.ui.api.api.KafkaConnectApi;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class ApiHelper {
    int partitions = 1;
    int replicationFactor = 1;
    String newTopic = "new-topic";
    String baseURL = "http://localhost:8080/";




    @SneakyThrows
    private TopicsApi topicApi(){
        ApiClient defaultClient = new ApiClient();
        defaultClient.setBasePath(baseURL);
        TopicsApi topicsApi = new TopicsApi(defaultClient);
        return topicsApi;
        }




    @SneakyThrows
    public void createTopic(String clusterName, String topicName) {
        TopicCreation topic = new TopicCreation();
        topic.setName(topicName);
        topic.setPartitions(partitions);
        topic.setReplicationFactor(replicationFactor);
        topicApi().createTopic(clusterName,topic).block();
    }

    @SneakyThrows
    public void deleteTopic(String clusterName, String topicName) {
        topicApi().deleteTopic(clusterName,topicName).block();
    }

    @SneakyThrows
    private KafkaConnectApi connectorApi(){
        ApiClient defaultClient = new ApiClient();
        defaultClient.setBasePath(baseURL);
        KafkaConnectApi connectorsApi = new KafkaConnectApi(defaultClient);
        return connectorsApi;
    }

    @SneakyThrows
    public void deleteConnector(String clusterName, String connectName, String connectorName) {
        connectorApi().deleteConnector(clusterName, connectName, connectorName).block();
    }

    @SneakyThrows
    public void createConnector(String clusterName, String connectName, String connectorName, String configJson) {
        NewConnector connector = new NewConnector();
        connector.setName(connectorName);
        Map<String, Object> configMap = new ObjectMapper().readValue(configJson, HashMap.class);
        connector.setConfig(configMap);
        connectorApi().createConnector(clusterName, connectName, connector).block();
    }

    @SneakyThrows
    private MessagesApi messageApi() {
        ApiClient defaultClient = new ApiClient();
        defaultClient.setBasePath(baseURL);
        MessagesApi messagesApi = new MessagesApi(defaultClient);
        return messagesApi;
    }

    @SneakyThrows
    public void sendMessage(String clusterName, String topicName, String messageContentJson, String messageKey){
        CreateTopicMessage createMessage = new CreateTopicMessage();
        createMessage.setContent(messageContentJson);
        createMessage.setKey(messageKey);
        messageApi().sendTopicMessages(clusterName, topicName, createMessage).block();
    }
}
