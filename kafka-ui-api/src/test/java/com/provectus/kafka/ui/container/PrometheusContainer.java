package com.provectus.kafka.ui.container;

import org.testcontainers.containers.GenericContainer;

public class PrometheusContainer extends GenericContainer<PrometheusContainer> {

  public PrometheusContainer() {
    super("prom/prometheus:latest");
    setCommandParts(new String[] {
        "--web.enable-remote-write-receiver",
        "--config.file=/etc/prometheus/prometheus.yml"
    });
    addExposedPort(9090);
  }

  public String url() {
    return "http://" + getHost() + ":" + getMappedPort(9090);
  }
}
