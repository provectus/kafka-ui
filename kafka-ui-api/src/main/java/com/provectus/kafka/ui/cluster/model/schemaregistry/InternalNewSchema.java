package com.provectus.kafka.ui.cluster.model.schemaregistry;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.provectus.kafka.ui.model.SchemaType;
import lombok.Data;

@Data
public class InternalNewSchema {
    private String schema;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private SchemaType schemaType;

    public InternalNewSchema(String schema, SchemaType schemaType) {
        this.schema = schema;
        this.schemaType = schemaType;
    }
}
