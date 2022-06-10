package com.provectus.kafka.ui.helpers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.provectus.kafka.ui.api.ApiClient;
import com.provectus.kafka.ui.api.api.KafkaConnectApi;
import com.provectus.kafka.ui.api.api.MessagesApi;
import com.provectus.kafka.ui.api.api.SchemasApi;
import com.provectus.kafka.ui.api.api.TopicsApi;
import com.provectus.kafka.ui.api.model.CreateTopicMessage;
import com.provectus.kafka.ui.api.model.ErrorResponse;
import com.provectus.kafka.ui.api.model.NewConnector;
import com.provectus.kafka.ui.api.model.NewSchemaSubject;
import com.provectus.kafka.ui.api.model.SchemaType;
import com.provectus.kafka.ui.api.model.TopicCreation;
import com.provectus.kafka.ui.base.TestConfiguration;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.HashMap;
import java.util.Map;

import static com.codeborne.selenide.Selenide.sleep;


@Slf4j
public class ApiHelper {

    int partitions = 1;
    int replicationFactor = 1;
    String newTopic = "new-topic";
    String baseURL = TestConfiguration.BASE_API_URL;


    @SneakyThrows
    private TopicsApi topicApi() {
        return new TopicsApi(new ApiClient().setBasePath(baseURL));
    }

    @SneakyThrows
    private SchemasApi schemaApi(){
        return new SchemasApi(new ApiClient().setBasePath(baseURL));
    }

    @SneakyThrows
    private KafkaConnectApi connectorApi() {
        return new KafkaConnectApi(new ApiClient().setBasePath(baseURL));
    }

    @SneakyThrows
    private MessagesApi messageApi() {
        return new MessagesApi(new ApiClient().setBasePath(baseURL));
    }

    @SneakyThrows
    public void createTopic(String clusterName, String topicName) {
        TopicCreation topic = new TopicCreation();
        topic.setName(topicName);
        topic.setPartitions(partitions);
        topic.setReplicationFactor(replicationFactor);
        deleteTopic(clusterName, topicName);
        sleep(2000);
        try {
            topicApi().createTopic(clusterName, topic).block();
        } catch (WebClientResponseException ex) {
            ex.printStackTrace();
        }
    }

    public void deleteTopic(String clusterName, String topicName) {
        try {
            topicApi().deleteTopic(clusterName, topicName).block();
        } catch (WebClientResponseException ex) {
            ErrorResponse errorResponse = new Gson().fromJson(ex.getResponseBodyAsString(), ErrorResponse.class);
            if (errorResponse.getMessage().startsWith("This server does not host this")) {
                log.info("This server does not host this " + topicName);
            } else {
                throw ex;
            }
        }
    }

    @SneakyThrows
    public void createSchema(String clusterName, String schemaName, SchemaType type, String schemaValue){
        NewSchemaSubject schemaSubject = new NewSchemaSubject();
        schemaSubject.setSubject(schemaName);
        schemaSubject.setSchema(schemaValue);
        schemaSubject.setSchemaType(type);
        try {
            schemaApi().createNewSchema(clusterName, schemaSubject).block();
        } catch (WebClientResponseException ex){
            ex.printStackTrace();
        }
    }

    @SneakyThrows
    public void deleteSchema(String clusterName, String schemaName){
        try {
            schemaApi().deleteSchema(clusterName, schemaName).block();
        } catch (WebClientResponseException ignore) {
        }
    }

    @SneakyThrows
    public void deleteConnector(String clusterName, String connectName, String connectorName) {
        try {
            connectorApi().deleteConnector(clusterName, connectName, connectorName).block();
        } catch (WebClientResponseException ignore) {
        }
    }

    @SneakyThrows
    public void createConnector(String clusterName, String connectName, String connectorName, String configJson) {
        NewConnector connector = new NewConnector();
        connector.setName(connectorName);
        Map<String, Object> configMap = new ObjectMapper().readValue(configJson, HashMap.class);
        connector.setConfig(configMap);
        try {
            connectorApi().deleteConnector(clusterName, connectName, connectorName).block();
        } catch (WebClientResponseException ignored){
        }
        connectorApi().createConnector(clusterName, connectName, connector).block();
    }

    public String getFirstConnectName(String clusterName) {
        return connectorApi().getConnects(clusterName).blockFirst().getName();
    }

    @SneakyThrows
    public void sendMessage(String clusterName, String topicName, String messageContentJson,
            String messageKey) {
        CreateTopicMessage createMessage = new CreateTopicMessage();
        createMessage.partition(0);
        createMessage.setContent(messageContentJson);
        createMessage.setKey(messageKey);
        try {
            messageApi().sendTopicMessages(clusterName, topicName, createMessage).block();
        } catch (WebClientResponseException ex) {
            ex.getRawStatusCode();
        }
    }
}
