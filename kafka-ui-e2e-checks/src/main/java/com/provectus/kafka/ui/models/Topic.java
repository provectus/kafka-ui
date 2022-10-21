package com.provectus.kafka.ui.models;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class Topic {
    private String name, cleanupPolicyValue, timeToRetainData, maxSizeOnDisk, maxMessageBytes, messageKey, messageContent ;
}
