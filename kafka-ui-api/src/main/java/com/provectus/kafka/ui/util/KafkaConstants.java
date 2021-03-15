package com.provectus.kafka.ui.util;

import java.util.AbstractMap;
import java.util.Map;

import static org.apache.kafka.common.config.TopicConfig.*;

public final class KafkaConstants {

    private KafkaConstants() {
    }

    public static final Map<String, String> TOPIC_DEFAULT_CONFIGS = Map.ofEntries(
            new AbstractMap.SimpleEntry<>(CLEANUP_POLICY_CONFIG, CLEANUP_POLICY_DELETE),
            new AbstractMap.SimpleEntry<>(COMPRESSION_TYPE_CONFIG, "producer"),
            new AbstractMap.SimpleEntry<>(DELETE_RETENTION_MS_CONFIG, "86400000"),
            new AbstractMap.SimpleEntry<>(FILE_DELETE_DELAY_MS_CONFIG, "60000"),
            new AbstractMap.SimpleEntry<>(FLUSH_MESSAGES_INTERVAL_CONFIG, "9223372036854775807"),
            new AbstractMap.SimpleEntry<>(FLUSH_MS_CONFIG, "9223372036854775807"),
            new AbstractMap.SimpleEntry<>("follower.replication.throttled.replicas", ""),
            new AbstractMap.SimpleEntry<>(INDEX_INTERVAL_BYTES_CONFIG, "4096"),
            new AbstractMap.SimpleEntry<>("leader.replication.throttled.replicas", ""),
            new AbstractMap.SimpleEntry<>(MAX_COMPACTION_LAG_MS_CONFIG, "9223372036854775807"),
            new AbstractMap.SimpleEntry<>(MAX_MESSAGE_BYTES_CONFIG, "1000012"),
            new AbstractMap.SimpleEntry<>(MESSAGE_TIMESTAMP_DIFFERENCE_MAX_MS_CONFIG, "9223372036854775807"),
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
}