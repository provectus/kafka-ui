package com.provectus.kafka.ui.cluster.config;

import com.provectus.kafka.ui.cluster.util.JmxMetricsNames;
import com.provectus.kafka.ui.cluster.util.JmxPoolFactory;
import org.apache.commons.pool2.KeyedObjectPool;
import org.apache.commons.pool2.impl.GenericKeyedObjectPool;
import org.apache.commons.pool2.impl.GenericKeyedObjectPoolConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jmx.export.MBeanExporter;

import javax.management.remote.JMXConnector;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Configuration
public class Config {

    @Bean
    public KeyedObjectPool<String, JMXConnector> pool() {
        GenericKeyedObjectPool<String, JMXConnector> pool =  new GenericKeyedObjectPool<>(new JmxPoolFactory());
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
    public MBeanExporter exporter()
    {
        final MBeanExporter exporter = new MBeanExporter();
        exporter.setAutodetect(true);
        exporter.setExcludedBeans("pool");
        return exporter;
    }

    @Bean
    public List<String> jmxMetricsNames() {
        return Stream.of(JmxMetricsNames.values()).map(Enum::name).collect(Collectors.toList());
    }
}
