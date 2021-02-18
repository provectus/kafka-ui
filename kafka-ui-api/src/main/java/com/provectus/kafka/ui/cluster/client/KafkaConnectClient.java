package com.provectus.kafka.ui.cluster.client;

import com.provectus.kafka.ui.connect.ApiClient;
import com.provectus.kafka.ui.connect.api.ConnectApi;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class KafkaConnectClient extends ConnectApi {

    public KafkaConnectClient(ApiClient apiClient) {
        super(apiClient);
    }

    private static final Map<String, KafkaConnectClient> CACHE = new ConcurrentHashMap<>();

    public static KafkaConnectClient createClient(String basePath) {
        return CACHE.computeIfAbsent(basePath, path -> new KafkaConnectClient(new ApiClient().setBasePath(path)));
    }
}
