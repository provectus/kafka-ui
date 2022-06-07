package com.provectus.kafka.ui.util;

import static org.apache.kafka.common.config.TopicConfig.CLEANUP_POLICY_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.CLEANUP_POLICY_DELETE;
import static org.apache.kafka.common.config.TopicConfig.COMPRESSION_TYPE_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.DELETE_RETENTION_MS_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.FILE_DELETE_DELAY_MS_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.FLUSH_MESSAGES_INTERVAL_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.FLUSH_MS_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.INDEX_INTERVAL_BYTES_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.MAX_COMPACTION_LAG_MS_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.MAX_MESSAGE_BYTES_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.MESSAGE_DOWNCONVERSION_ENABLE_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.MESSAGE_TIMESTAMP_DIFFERENCE_MAX_MS_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.MESSAGE_TIMESTAMP_TYPE_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.MIN_CLEANABLE_DIRTY_RATIO_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.MIN_COMPACTION_LAG_MS_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.MIN_IN_SYNC_REPLICAS_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.PREALLOCATE_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.RETENTION_BYTES_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.RETENTION_MS_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.SEGMENT_BYTES_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.SEGMENT_INDEX_BYTES_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.SEGMENT_JITTER_MS_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.SEGMENT_MS_CONFIG;
import static org.apache.kafka.common.config.TopicConfig.UNCLEAN_LEADER_ELECTION_ENABLE_CONFIG;

import java.util.AbstractMap;
import java.util.Map;

public final class KafkaConstants {

  private static final String LONG_MAX_STRING = Long.toString(Long.MAX_VALUE);

  public static final Map<String, String> TOPIC_DEFAULT_CONFIGS = Map.ofEntries(
      new AbstractMap.SimpleEntry<>(CLEANUP_POLICY_CONFIG, CLEANUP_POLICY_DELETE),
      new AbstractMap.SimpleEntry<>(COMPRESSION_TYPE_CONFIG, "producer"),
      new AbstractMap.SimpleEntry<>(DELETE_RETENTION_MS_CONFIG, "86400000"),
      new AbstractMap.SimpleEntry<>(FILE_DELETE_DELAY_MS_CONFIG, "60000"),
      new AbstractMap.SimpleEntry<>(FLUSH_MESSAGES_INTERVAL_CONFIG, LONG_MAX_STRING),
      new AbstractMap.SimpleEntry<>(FLUSH_MS_CONFIG, LONG_MAX_STRING),
      new AbstractMap.SimpleEntry<>("follower.replication.throttled.replicas", ""),
      new AbstractMap.SimpleEntry<>(INDEX_INTERVAL_BYTES_CONFIG, "4096"),
      new AbstractMap.SimpleEntry<>("leader.replication.throttled.replicas", ""),
      new AbstractMap.SimpleEntry<>(MAX_COMPACTION_LAG_MS_CONFIG, LONG_MAX_STRING),
      new AbstractMap.SimpleEntry<>(MAX_MESSAGE_BYTES_CONFIG, "1000012"),
      new AbstractMap.SimpleEntry<>(MESSAGE_TIMESTAMP_DIFFERENCE_MAX_MS_CONFIG, LONG_MAX_STRING),
      new AbstractMap.SimpleEntry<>(MESSAGE_TIMESTAMP_TYPE_CONFIG, "CreateTime"),
      new AbstractMap.SimpleEntry<>(MIN_CLEANABLE_DIRTY_RATIO_CONFIG, "0.5"),
      new AbstractMap.SimpleEntry<>(MIN_COMPACTION_LAG_MS_CONFIG, "0"),
      new AbstractMap.SimpleEntry<>(MIN_IN_SYNC_REPLICAS_CONFIG, "1"),
      new AbstractMap.SimpleEntry<>(PREALLOCATE_CONFIG, "false"),
      new AbstractMap.SimpleEntry<>(RETENTION_BYTES_CONFIG, "-1"),
      new AbstractMap.SimpleEntry<>(RETENTION_MS_CONFIG, "604800000"),
      new AbstractMap.SimpleEntry<>(SEGMENT_BYTES_CONFIG, "1073741824"),
      new AbstractMap.SimpleEntry<>(SEGMENT_INDEX_BYTES_CONFIG, "10485760"),
      new AbstractMap.SimpleEntry<>(SEGMENT_JITTER_MS_CONFIG, "0"),
      new AbstractMap.SimpleEntry<>(SEGMENT_MS_CONFIG, "604800000"),
      new AbstractMap.SimpleEntry<>(UNCLEAN_LEADER_ELECTION_ENABLE_CONFIG, "false"),
      new AbstractMap.SimpleEntry<>(MESSAGE_DOWNCONVERSION_ENABLE_CONFIG, "true")
  );

  private KafkaConstants() {
  }
}