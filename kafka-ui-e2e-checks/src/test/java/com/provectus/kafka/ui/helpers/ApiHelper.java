package com.provectus.kafka.ui.helpers;

import com.provectus.kafka.ui.api.ApiClient;
import com.provectus.kafka.ui.api.api.SchemasApi;
import com.provectus.kafka.ui.api.api.TopicsApi;
import com.provectus.kafka.ui.api.model.NewSchemaSubject;
import com.provectus.kafka.ui.api.model.SchemaType;
import com.provectus.kafka.ui.api.model.TopicCreation;
import lombok.SneakyThrows;
import org.springframework.web.reactive.function.client.WebClientResponseException;

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
    private SchemasApi schemaApi(){
        ApiClient defaultClient = new ApiClient();
        defaultClient.setBasePath(baseURL);
        SchemasApi schemasApi = new SchemasApi(defaultClient);
        return schemasApi;
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
        try {
            topicApi().deleteTopic(clusterName, topicName).block();
        } catch (WebClientResponseException ex) {
            if (ex.getRawStatusCode() != 404)  // except already deleted
                throw ex;
        }
    }
    @SneakyThrows
    public void createSchema(String clusterName, String schemaName, SchemaType type, String schemaValue){
        NewSchemaSubject schemaSubject = new NewSchemaSubject();
        schemaSubject.setSubject(schemaName);
        schemaSubject.setSchema(schemaValue);
        schemaSubject.setSchemaType(type);
        schemaApi().createNewSchema(clusterName, schemaSubject).block();
    }

    @SneakyThrows
    public void deleteSchema(String clusterName, String schemaName){
        schemaApi().deleteSchema(clusterName, schemaName);
    }


}
