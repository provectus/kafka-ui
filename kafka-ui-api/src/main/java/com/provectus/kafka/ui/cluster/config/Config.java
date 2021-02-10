package com.provectus.kafka.ui.cluster.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.cluster.util.JmxPoolFactory;
import org.apache.commons.pool2.KeyedObjectPool;
import org.apache.commons.pool2.impl.GenericKeyedObjectPool;
import org.apache.commons.pool2.impl.GenericKeyedObjectPoolConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.codec.json.Jackson2JsonEncoder;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.jmx.export.MBeanExporter;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import javax.management.remote.JMXConnector;

@Configuration
public class Config {

    @Bean
    public KeyedObjectPool<String, JMXConnector> pool() {
        GenericKeyedObjectPool<String, JMXConnector> pool = new GenericKeyedObjectPool<>(new JmxPoolFactory());
        pool.setConfig(poolConfig());
        return pool;
    }

    private GenericKeyedObjectPoolConfig poolConfig() {
        GenericKeyedObjectPoolConfig poolConfig = new GenericKeyedObjectPoolConfig();
        poolConfig.setMaxIdlePerKey(3);
        poolConfig.setMaxTotalPerKey(3);
        return poolConfig;
    }

    @Bean
    public MBeanExporter exporter() {
        final MBeanExporter exporter = new MBeanExporter();
        exporter.setAutodetect(true);
        exporter.setExcludedBeans("pool");
        return exporter;
    }

    @Bean
    public WebClient webClient(ObjectMapper objectMapper) {
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(clientCodecConfigurer ->
                        clientCodecConfigurer.defaultCodecs().jackson2JsonEncoder(new Jackson2JsonEncoder(objectMapper, MediaType.APPLICATION_JSON)))
                .build();
        return WebClient.builder()
                .exchangeStrategies(strategies)
                .build();
    }

    @Bean
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder mapperBuilder) {
        return mapperBuilder.build().setSerializationInclusion(JsonInclude.Include.NON_NULL);
    }
}
