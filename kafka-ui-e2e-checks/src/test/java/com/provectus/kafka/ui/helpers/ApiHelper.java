package com.provectus.kafka.ui.helpers;

import lombok.SneakyThrows;

import com.provectus.kafka.ui.api.*;
import com.provectus.kafka.ui.api.model.*;
import com.provectus.kafka.ui.api.api.TopicsApi;

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
       topicApi().createTopic(clusterName,topic);
    }

    @SneakyThrows
    public void deleteTopic(String clusterName, String topicName) {
        topicApi().deleteTopic(clusterName,topicName);
    }

}
