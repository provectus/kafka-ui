package com.provectus.kafka.ui.jmx;

import com.provectus.kafka.ui.cluster.model.MetricsConstants;

import java.util.Map;

import static java.util.Map.entry;

public final class JmxConstants {

    private JmxConstants() {}

    public static final Map<MBeanInfo, String> mbeanToAttributeMap = Map.ofEntries(
            entry(MBeanInfo.of("kafka.server:type=KafkaServer,name=ClusterId", "Value"), MetricsConstants.CLUSTER_ID),
            entry(MBeanInfo.of("kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec", "Count"), MetricsConstants.BYTES_IN_PER_SEC),
            entry(MBeanInfo.of("kafka.server:type=BrokerTopicMetrics,name=BytesOutPerSec", "Count"), MetricsConstants.BYTES_OUT_PER_SEC),
            entry(MBeanInfo.of("kafka.controller:type=KafkaController,name=ActiveControllerCount", "Value"), MetricsConstants.ACTIVE_CONTROLLER_COUNT),
            entry(MBeanInfo.of("kafka.controller:type=KafkaController,name=GlobalPartitionCount", "Value"), MetricsConstants.ONLINE_PARTITION_COUNT),
            entry(MBeanInfo.of("kafka.controller:type=KafkaController,name=OfflinePartitionsCount", "Value"), MetricsConstants.OFFLINE_PARTITION_COUNT),
            entry(MBeanInfo.of("kafka.server:type=ReplicaManager,name=UnderReplicatedPartitions", "Value"), MetricsConstants.UNDER_REPLICATED_PARTITIONS)
    );

}
