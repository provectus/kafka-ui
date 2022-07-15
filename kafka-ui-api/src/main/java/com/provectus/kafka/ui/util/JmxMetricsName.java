package com.provectus.kafka.ui.util;

public enum JmxMetricsName {
  MESSAGES_IN_PER_SEC("MessagesInPerSec"),
  BYTES_IN_PER_SEC("BytesInPerSec"),
  REPLICATION_BYTES_IN_PER_SEC("ReplicationBytesInPerSec"),
  REQUESTS_PER_SEC("RequestsPerSec"),
  ERRORS_PER_SEC("ErrorsPerSec"),
  MESSAGE_CONVERSIONS_PER_SEC("MessageConversionsPerSec"),
  BYTES_OUT_PER_SEC("BytesOutPerSec"),
  REPLICATION_BYTES_OUT_PER_SEC("ReplicationBytesOutPerSec"),
  NO_KEY_COMPACTED_TOPIC_RECORDS_PER_SEC("NoKeyCompactedTopicRecordsPerSec"),
  INVALID_MAGIC_NUMBER_RECORDS_PER_SEC("InvalidMagicNumberRecordsPerSec"),
  INVALID_MESSAGE_CRC_RECORDS_PER_SEC("InvalidMessageCrcRecordsPerSec"),
  INVALID_OFFSET_OR_SEQUENCE_RECORDS_PER_SEC("InvalidOffsetOrSequenceRecordsPerSec"),
  UNCLEAN_LEADER_ELECTIONS_PER_SEC("UncleanLeaderElectionsPerSec"),
  ISR_SHRINKS_PER_SEC("IsrShrinksPerSec"),
  ISR_EXPANDS_PER_SEC("IsrExpandsPerSec"),
  REASSIGNMENT_BYTES_OUT_PER_SEC("ReassignmentBytesOutPerSec"),
  REASSIGNMENT_BYTES_IN_PER_SEC("ReassignmentBytesInPerSec"),
  PRODUCE_MESSAGE_CONVERSIONS_PER_SEC("ProduceMessageConversionsPerSec"),
  FAILED_FETCH_REQUESTS_PER_SEC("FailedFetchRequestsPerSec"),
  ZOOKEEPER_SYNC_CONNECTS_PER_SEC("ZooKeeperSyncConnectsPerSec"),
  BYTES_REJECTED_PER_SEC("BytesRejectedPerSec"),
  ZOO_KEEPER_AUTH_FAILURES_PER_SEC("ZooKeeperAuthFailuresPerSec"),
  TOTAL_FETCH_REQUESTS_PER_SEC("TotalFetchRequestsPerSec"),
  FAILED_ISR_UPDATES_PER_SEC("FailedIsrUpdatesPerSec"),
  INCREMENTAL_FETCH_SESSION_EVICTIONS_PER_SEC("IncrementalFetchSessionEvictionsPerSec"),
  FETCH_MESSAGE_CONVERSIONS_PER_SEC("FetchMessageConversionsPerSec"),
  FAILED_PRODUCE_REQUESTS_PER_SEC("FailedProduceRequestsPerSe");

  private final String value;

  JmxMetricsName(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }
}
