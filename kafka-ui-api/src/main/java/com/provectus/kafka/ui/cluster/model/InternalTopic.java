package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.model.TopicConfig;
import com.provectus.kafka.ui.model.TopicDetails;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder(toBuilder = true)
public class InternalTopic {

    private final String name;

    private final boolean internal;

    private final List<InternalPartition> partitions;

    private final TopicDetails topicDetails;

    private final List<TopicConfig> topicConfigs;

}
