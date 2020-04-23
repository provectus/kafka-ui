package com.provectus.kafka.ui.cluster.mapper;

import com.provectus.kafka.ui.cluster.model.InternalBrokersMetrics;
import com.provectus.kafka.ui.model.BrokersMetrics;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BrokersMetricsMapper {

    InternalBrokersMetrics toBrokersMetricsDto (BrokersMetrics brokersMetrics);

    BrokersMetrics toBrokersMetrics (InternalBrokersMetrics brokersMetrics);
}
