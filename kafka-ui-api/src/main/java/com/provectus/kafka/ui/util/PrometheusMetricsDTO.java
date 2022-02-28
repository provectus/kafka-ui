package com.provectus.kafka.ui.util;

import java.util.ArrayList;

/*
To test Prometheus metrics in local we Must first run docker-compose -f ./documentation/compose/kafka-clusters-only.yaml up
Prometheus will run on localhost:9090. Data will be scraped from jmx_exporter which will be running on both kafka-brokers and zookeeper
This DTO class is temporary and a future decision will need to be made if we are to continue using a separate DTO object for the prometheus metrics or
merge it with BrokerMetricsDTO which is currently being used for the existing JMX metrics.
The current mechanism to retrieve Prometheus metrics queries the Prometheus API on localhost:9090/api/v1/query by passing a query in the body of the request.
As such endless permutations of metrics is available without java manipulation. Reducing overhead.
The config has not been tested in the cloud. All testing were done locally in docker. Therefore, more research is necessary to determine how to implement this in aws.
 */
public class PrometheusMetricsDTO {
  public String status;
  public Data data;

  private static class Metric {
    public String __name__;
    public String env;
    public String instance;
    public String job;
    public String topic;
  }

  private static class Result {
    public Metric metric;
    public ArrayList<Object> value;
  }

  private static class Data {
    public String resultType;
    public ArrayList<Result> result;
  }

}
