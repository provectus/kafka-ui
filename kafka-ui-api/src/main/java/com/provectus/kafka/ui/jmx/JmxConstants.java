package com.provectus.kafka.ui.jmx;

import com.provectus.kafka.ui.cluster.model.MetricsConstants;

import java.util.Map;

import static java.util.Map.entry;

public final class JmxConstants {

    private JmxConstants() {}

    public static final Map<MBeanInfo, String> mbeanToAttributeMap = Map.ofEntries(
            entry(MBeanInfo.of("kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec", "Count"), MetricsConstants.BYTES_IN_PER_SEC),
            entry(MBeanInfo.of("kafka.server:type=BrokerTopicMetrics,name=BytesOutPerSec", "Count"), MetricsConstants.BYTES_OUT_PER_SEC)
    );

}
