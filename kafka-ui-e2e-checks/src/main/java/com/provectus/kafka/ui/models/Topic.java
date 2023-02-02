package com.provectus.kafka.ui.models;

import com.provectus.kafka.ui.pages.topic.enums.CleanupPolicyValue;
import com.provectus.kafka.ui.pages.topic.enums.CustomParameterType;
import com.provectus.kafka.ui.pages.topic.enums.MaxSizeOnDisk;
import com.provectus.kafka.ui.pages.topic.enums.TimeToRetain;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class Topic {
    private String name, timeToRetainData, maxMessageBytes, messageKey, messageContent, customParameterValue;
    private int numberOfPartitions;
    private CustomParameterType customParameterType;
    private CleanupPolicyValue cleanupPolicyValue;
    private MaxSizeOnDisk maxSizeOnDisk;
    private TimeToRetain timeToRetain;
}
