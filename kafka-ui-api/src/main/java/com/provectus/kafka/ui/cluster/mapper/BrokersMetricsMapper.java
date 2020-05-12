package com.provectus.kafka.ui.cluster.mapper;

import com.provectus.kafka.ui.cluster.model.InternalClusterMetrics;
import com.provectus.kafka.ui.model.BrokersMetrics;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BrokersMetricsMapper {

    InternalClusterMetrics toBrokersMetricsDto (BrokersMetrics brokersMetrics);

    BrokersMetrics toBrokersMetrics (InternalClusterMetrics brokersMetrics);
}
