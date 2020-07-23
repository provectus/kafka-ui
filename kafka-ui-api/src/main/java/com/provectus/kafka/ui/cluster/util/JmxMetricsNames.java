package com.provectus.kafka.ui.cluster.util;

import com.google.common.collect.ImmutableList;

public enum JmxMetricsNames {
    MessagesInPerSec,
    BytesInPerSec,
    ReplicationBytesInPerSec,
    RequestsPerSec,
    ErrorsPerSec,
    MessageConversionsPerSec,
    BytesOutPerSec,
    ReplicationBytesOutPerSec,
    NoKeyCompactedTopicRecordsPerSec,
    InvalidMagicNumberRecordsPerSec,
    InvalidMessageCrcRecordsPerSec,
    InvalidOffsetOrSequenceRecordsPerSec,
    UncleanLeaderElectionsPerSec,
    IsrShrinksPerSec,
    IsrExpandsPerSec,
    ReassignmentBytesOutPerSec,
    ReassignmentBytesInPerSec,
    ProduceMessageConversionsPerSec,
    FailedFetchRequestsPerSec,
    ZooKeeperSyncConnectsPerSec,
    BytesRejectedPerSec,
    ZooKeeperAuthFailuresPerSec,
    TotalFetchRequestsPerSec,
    FailedIsrUpdatesPerSec,
    IncrementalFetchSessionEvictionsPerSec,
    FetchMessageConversionsPerSec,
    FailedProduceRequestsPerSec
}
