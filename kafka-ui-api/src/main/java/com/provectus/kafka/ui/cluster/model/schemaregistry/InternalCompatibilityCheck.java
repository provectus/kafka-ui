package com.provectus.kafka.ui.cluster.model.schemaregistry;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class InternalCompatibilityCheck {
    @JsonProperty("is_compatible")
    private boolean isCompatible;
}
