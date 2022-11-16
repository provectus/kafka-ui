package com.provectus.kafka.ui.pages.topic.enums;

public enum CustomParameterType {
  COMPRESSION_TYPE("compression.type"),
  DELETE_RETENTION_MS("delete.retention.ms"),
  FILE_DELETE_DELAY_MS("file.delete.delay.ms"),
  FLUSH_MESSAGES("flush.messages"),
  FLUSH_MS("flush.ms"),
  FOLLOWER_REPLICATION_THROTTLED_REPLICAS("follower.replication.throttled.replicas"),
  INDEX_INTERVAL_BYTES("index.interval.bytes"),
  LEADER_REPLICATION_THROTTLED_REPLICAS("leader.replication.throttled.replicas"),
  MAX_COMPACTION_LAG_MS("max.compaction.lag.ms"),
  MESSAGE_DOWNCONVERSION_ENABLE("message.downconversion.enable"),
  MESSAGE_FORMAT_VERSION("message.format.version"),
  MESSAGE_TIMESTAMP_DIFFERENCE_MAX_MS("message.timestamp.difference.max.ms"),
  MESSAGE_TIMESTAMP_TYPE("message.timestamp.type"),
  MIN_CLEANABLE_DIRTY_RATIO("min.cleanable.dirty.ratio"),
  MIN_COMPACTION_LAG_MS("min.compaction.lag.ms"),
  PREALLOCATE("preallocate"),
  RETENTION_BYTES("retention.bytes"),
  SEGMENT_BYTES("segment.bytes"),
  SEGMENT_INDEX_BYTES("segment.index.bytes"),
  SEGMENT_JITTER_MS("segment.jitter.ms"),
  SEGMENT_MS("segment.ms"),
  UNCLEAN_LEADER_ELECTION_ENABLE("unclean.leader.election.enable");

  private final String optionValue;

  CustomParameterType(String optionValue) {
    this.optionValue = optionValue;
  }

  public String getOptionValue() {
    return optionValue;
  }
}
