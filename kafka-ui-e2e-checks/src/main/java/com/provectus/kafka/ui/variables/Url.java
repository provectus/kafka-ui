package com.provectus.kafka.ui.variables;

public interface Url {

  String BROKERS_LIST_URL = "http://%s:8080/ui/clusters/local/brokers";
  String TOPICS_LIST_URL = "http://%s:8080/ui/clusters/local/all-topics";
  String CONSUMERS_LIST_URL = "http://%s:8080/ui/clusters/local/consumer-groups";
  String SCHEMA_REGISTRY_LIST_URL = "http://%s:8080/ui/clusters/local/schemas";
  String KAFKA_CONNECT_LIST_URL = "http://%s:8080/ui/clusters/local/connectors";
  String KSQL_DB_LIST_URL = "http://%s:8080/ui/clusters/local/ksqldb/tables";
}
