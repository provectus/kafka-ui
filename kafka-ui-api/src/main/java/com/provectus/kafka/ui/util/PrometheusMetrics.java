package com.provectus.kafka.ui.util;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;
import java.util.function.BinaryOperator;
import java.util.function.Predicate;
import lombok.Data;

/*
  To test Prometheus metrics in local we Must first run
  docker-compose -f ./documentation/compose/kafka-clusters-only.yaml up. Prometheus will run on localhost:9090.
  Data will be scraped from jmx_exporter which will be running on both kafka-brokers and zookeeper. This DTO class
  is temporary and a future decision will need to be made if we are to continue using a separate DTO object for
  the prometheus metrics or merge it with BrokerMetricsDTO which is currently being used for the existing JMX metrics.
  The current mechanism to retrieve Prometheus metrics queries the Prometheus API on
  [KAFKA_CLUSTERS_N_PROMETHEUS]/api/v1/query by passing a query in the body of the request. As such endless permutations
  of metrics is available without java manipulation. Reducing overhead. The config has been tested in the AWS.
 */
@Data
public class PrometheusMetrics {
  private String status;
  private Data data;

  private Optional<BigDecimal> getValueWithoutTopic(final String metricsName, BinaryOperator<BigDecimal> reducer) {
    Predicate<Result> nonTopicMetrics = result -> "".equals(result.metric.topic) || result.metric.topic == null;
    return getValue(metricsName, nonTopicMetrics, reducer);
  }

  private Optional<BigDecimal> getValue(final String metricsName,
                                        final Predicate<? super Result> filter,
                                        final BinaryOperator<BigDecimal> reducer) {
    if ("success".equals(status) && data != null) {
      return data.result.stream()
          .filter(result -> result.metric.name.equals(metricsName))
          .filter(filter)
          .map(result -> new BigDecimal(result.value.get(1).toString()))
          .reduce(reducer);
    }
    return Optional.empty();
  }


  private Optional<BigDecimal> getSummarizedValue(final String metricsName) {
    return getValueWithoutTopic(metricsName, BigDecimal::add);
  }

  public Optional<BigDecimal> getBigDecimalMetric(JmxMetricsName jmxMetrics) {
    switch (jmxMetrics) {
      case BYTES_IN_PER_SEC:
        return getSummarizedValue(JmxMetricsName.BYTES_IN_PER_SEC.getValue());
      case BYTES_OUT_PER_SEC:
        return getSummarizedValue(JmxMetricsName.BYTES_OUT_PER_SEC.getValue());
      default:
        return Optional.empty();
    }
  }

  @lombok.Data
  public static class Metric {
    @JsonProperty("__name__")
    private String name;
    private String env;
    private String instance;
    private String job;
    private String topic;
  }

  @lombok.Data
  private static class Result {

    private Metric metric;

    private ArrayList<Object> value;
  }

  @lombok.Data
  public static class Data {
    private String resultType;
    private ArrayList<Result> result;
  }
}
