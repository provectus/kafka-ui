package com.provectus.kafka.ui.cluster.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@ConfigurationProperties("kafka")
@Data
public class KafkaJmxProperties {
    List<Jmx> jmxParams = new ArrayList<>();

    @Data
    public static class Jmx {
        private String clusterName;
        private int brokerId;
        private int port;
        private String host;
        private String url;
        private String serviceType;
    }
}
