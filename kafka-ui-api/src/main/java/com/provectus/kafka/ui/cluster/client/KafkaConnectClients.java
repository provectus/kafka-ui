package com.provectus.kafka.ui.cluster.client;

import com.provectus.kafka.ui.connect.ApiClient;
import com.provectus.kafka.ui.connect.api.ConnectApi;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public final class KafkaConnectClients {

    private static final Map<String, ConnectApi> CACHE = new ConcurrentHashMap<>();

    public static ConnectApi withBaseUrl(String basePath) {
        return CACHE.computeIfAbsent(basePath, path -> new ConnectApi(new ApiClient().setBasePath(path)));
    }
}
