package com.provectus.kafka.ui.helpers;

import com.provectus.kafka.ui.api.ApiClient;
import com.provectus.kafka.ui.api.api.TopicsApi;
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

}
