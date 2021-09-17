package com.provectus.kafka.ui.config;

import com.provectus.kafka.ui.model.JmxConnectionInfo;
import com.provectus.kafka.ui.util.JmxPoolFactory;
import javax.management.remote.JMXConnector;
import org.apache.commons.pool2.KeyedObjectPool;
import org.apache.commons.pool2.impl.GenericKeyedObjectPool;
import org.apache.commons.pool2.impl.GenericKeyedObjectPoolConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jmx.export.MBeanExporter;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class Config {

  @Bean
  public KeyedObjectPool<JmxConnectionInfo, JMXConnector> pool() {
    var pool = new GenericKeyedObjectPool<>(new JmxPoolFactory());
    pool.setConfig(poolConfig());
    return pool;
  }

  private GenericKeyedObjectPoolConfig poolConfig() {
    final var poolConfig = new GenericKeyedObjectPoolConfig();
    poolConfig.setMaxIdlePerKey(3);
    poolConfig.setMaxTotalPerKey(3);
    return poolConfig;
  }

  @Bean
  public MBeanExporter exporter() {
    final var exporter = new MBeanExporter();
    exporter.setAutodetect(true);
    exporter.setExcludedBeans("pool");
    return exporter;
  }

  @Bean
  public WebClient webClient() {
    return WebClient.create();
  }
}
