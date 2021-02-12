package com.provectus.kafka.ui.cluster.config;

import com.provectus.kafka.ui.cluster.util.JmxPoolFactory;
import org.apache.commons.pool2.KeyedObjectPool;
import org.apache.commons.pool2.impl.GenericKeyedObjectPool;
import org.apache.commons.pool2.impl.GenericKeyedObjectPoolConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jmx.export.MBeanExporter;
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
    public WebClient webClient() {
        return WebClient.create();
    }
}
