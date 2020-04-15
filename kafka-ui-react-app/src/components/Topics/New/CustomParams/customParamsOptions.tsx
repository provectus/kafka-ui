import { TopicCustomParamOptions } from '../../../../redux/interfaces/topic';

export const CUSTOM_PARAMS_OPTIONS: TopicCustomParamOptions = {
  "compressionType": {
    "optName": "compression.type",
    "defaultValue": "producer"
  },
  "leaderReplicationThrottledReplicas": {
    "optName": "leader.replication.throttled.replicas",
    "defaultValue": ""
  },
  "messageDownconversionEnable": {
    "optName": "message.downconversion.enable",
    "defaultValue": "true"
  },
  "segmentJitterMs": {
    "optName": "segment.jitter.ms",
    "defaultValue": "0"
  },
  "flushMs": {
    "optName": "flush.ms",
    "defaultValue": "9223372036854775807"
  },
  "followerReplicationThrottledReplicas": {
    "optName": "follower.replication.throttled.replicas",
    "defaultValue": ""
  },
  "segmentBytes": {
    "optName": "segment.bytes",
    "defaultValue": "1073741824"
  },
  "flushMessages": {
    "optName": "flush.messages",
    "defaultValue": "9223372036854775807"
  },
  "messageFormatVersion": {
    "optName": "message.format.version",
    "defaultValue": "2.3-IV1"
  },
  "fileDeleteDelayMs": {
    "optName": "file.delete.delay.ms",
    "defaultValue": "60000"
  },
  "max.compaction.lag.ms": {
    "optName": "max.compaction.lag.ms",
    "defaultValue": "9223372036854775807"
  },
  "minCompactionLagMs": {
    "optName": "min.compaction.lag.ms",
    "defaultValue": "0"
  },
  "messageTimestampType": {
    "optName": "message.timestamp.type",
    "defaultValue": "CreateTime"
  },
  "preallocate": {
    "optName": "preallocate",
    "defaultValue": "false"
  },
  "minCleanableDirtyRatio": {
    "optName": "min.cleanable.dirty.ratio",
    "defaultValue": "0.5"
  },
  "indexIntervalBytes": {
    "optName": "index.interval.bytes",
    "defaultValue": "4096"
  },
  "uncleanLeaderElectionEnable": {
    "optName": "unclean.leader.election.enable",
    "defaultValue": "true"
  },
  "deleteRetentionMs": {
    "optName": "delete.retention.ms",
    "defaultValue": "86400000"
  },
  "segmentMs": {
    "optName": "segment.ms",
    "defaultValue": "604800000"
  },
  "messageTimestampDifferenceMaxMs": {
    "optName": "message.timestamp.difference.max.ms",
    "defaultValue": "9223372036854775807"
  },
  "segmentIndexBytes": {
    "optName": "segment.index.bytes",
    "defaultValue": "10485760"
  }
}
