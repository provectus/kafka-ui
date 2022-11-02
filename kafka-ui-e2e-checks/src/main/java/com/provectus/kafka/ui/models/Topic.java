package com.provectus.kafka.ui.models;

import com.provectus.kafka.ui.pages.topic.TopicCreateEditForm;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class Topic {
    private String name, timeToRetainData, maxMessageBytes, messageKey, messageContent,
            partitions, customParameter;
    private TopicCreateEditForm.CleanupPolicyValue cleanupPolicyValue;
    private TopicCreateEditForm.MaxSizeOnDisk maxSizeOnDisk;
}