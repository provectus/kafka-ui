package com.provectus.kafka.ui.pages.ksqlDb.models;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class Stream {

    private String name, topicName, valueFormat, partitions;
}
