package com.provectus.kafka.ui.service.metrics.scrape.jmx;

import com.provectus.kafka.ui.model.MetricsScrapeProperties;
import com.provectus.kafka.ui.service.metrics.RawMetric;
import java.io.Closeable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import javax.management.MBeanAttributeInfo;
import javax.management.MBeanServerConnection;
import javax.management.ObjectName;
import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.common.Node;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;


@Component //need to be a component, since
@Slf4j
public class JmxMetricsRetriever implements Closeable {

  private static final boolean SSL_JMX_SUPPORTED;

  static {
    // see JmxSslSocketFactory doc for details
    SSL_JMX_SUPPORTED = JmxSslSocketFactory.initialized();
  }

  private static final String JMX_URL = "service:jmx:rmi:///jndi/rmi://";
  private static final String JMX_SERVICE_TYPE = "jmxrmi";
  private static final String CANONICAL_NAME_PATTERN = "kafka.server*:*";

  @Override
  public void close() {
    JmxSslSocketFactory.clearFactoriesCache();
  }

  public Mono<List<RawMetric>> retrieveFromNode(MetricsScrapeProperties scrapeProperties, Node node) {
    if (isSslJmxEndpoint(scrapeProperties) && !SSL_JMX_SUPPORTED) {
      log.warn("Cluster has jmx ssl configured, but it is not supported by app");
      return Mono.just(List.of());
    }
    return Mono.fromSupplier(() -> retrieveSync(scrapeProperties, node))
        .subscribeOn(Schedulers.boundedElastic());
  }

  private boolean isSslJmxEndpoint(MetricsScrapeProperties scrapeProperties) {
    return scrapeProperties.getKeystoreConfig() != null
        && scrapeProperties.getKeystoreConfig().getKeystoreLocation() != null;
  }

  @SneakyThrows
  private List<RawMetric> retrieveSync(MetricsScrapeProperties scrapeProperties, Node node) {
    String jmxUrl = JMX_URL + node.host() + ":" + scrapeProperties.getPort() + "/" + JMX_SERVICE_TYPE;
    log.debug("Collection JMX metrics for {}", jmxUrl);
    List<RawMetric> result = new ArrayList<>();
    withJmxConnector(jmxUrl, scrapeProperties, jmxConnector -> getMetricsFromJmx(jmxConnector, result));
    log.debug("{} metrics collected for {}", result.size(), jmxUrl);
    return result;
  }

  private void withJmxConnector(String jmxUrl,
                                MetricsScrapeProperties scrapeProperties,
                                Consumer<JMXConnector> consumer) {
    var env = prepareJmxEnvAndSetThreadLocal(scrapeProperties);
    try (JMXConnector connector = JMXConnectorFactory.newJMXConnector(new JMXServiceURL(jmxUrl), env)) {
      try {
        connector.connect(env);
      } catch (Exception exception) {
        log.error("Error connecting to {}", jmxUrl, exception);
        return;
      }
      consumer.accept(connector);
    } catch (Exception e) {
      log.error("Error getting jmx metrics from {}", jmxUrl, e);
    } finally {
      JmxSslSocketFactory.clearThreadLocalContext();
    }
  }

  private Map<String, Object> prepareJmxEnvAndSetThreadLocal(MetricsScrapeProperties scrapeProperties) {
    Map<String, Object> env = new HashMap<>();
    if (isSslJmxEndpoint(scrapeProperties)) {
      var truststoreConfig = scrapeProperties.getTruststoreConfig();
      var keystoreConfig = scrapeProperties.getKeystoreConfig();
      JmxSslSocketFactory.setSslContextThreadLocal(
          truststoreConfig != null ? truststoreConfig.getTruststoreLocation() : null,
          truststoreConfig != null ? truststoreConfig.getTruststorePassword() : null,
          keystoreConfig != null ? keystoreConfig.getKeystoreLocation() : null,
          keystoreConfig != null ? keystoreConfig.getKeystorePassword() : null
      );
      JmxSslSocketFactory.editJmxConnectorEnv(env);
    }

    if (StringUtils.isNotEmpty(scrapeProperties.getUsername())
        && StringUtils.isNotEmpty(scrapeProperties.getPassword())) {
      env.put(
          JMXConnector.CREDENTIALS,
          new String[] {scrapeProperties.getUsername(), scrapeProperties.getPassword()}
      );
    }
    return env;
  }

  @SneakyThrows
  private void getMetricsFromJmx(JMXConnector jmxConnector, List<RawMetric> sink) {
    MBeanServerConnection msc = jmxConnector.getMBeanServerConnection();
    var jmxMetrics = msc.queryNames(new ObjectName(CANONICAL_NAME_PATTERN), null);
    for (ObjectName jmxMetric : jmxMetrics) {
      sink.addAll(extractObjectMetrics(jmxMetric, msc));
    }
  }

  @SneakyThrows
  private List<RawMetric> extractObjectMetrics(ObjectName objectName, MBeanServerConnection msc) {
    MBeanAttributeInfo[] attrNames = msc.getMBeanInfo(objectName).getAttributes();
    Object[] attrValues = new Object[attrNames.length];
    for (int i = 0; i < attrNames.length; i++) {
      attrValues[i] = msc.getAttribute(objectName, attrNames[i].getName());
    }
    return JmxMetricsFormatter.constructMetricsList(objectName, attrNames, attrValues);
  }

}

