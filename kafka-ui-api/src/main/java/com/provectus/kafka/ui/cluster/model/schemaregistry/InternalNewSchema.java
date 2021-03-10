package com.provectus.kafka.ui.cluster.model.schemaregistry;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.provectus.kafka.ui.model.NewSchemaSubject;
import com.provectus.kafka.ui.model.SchemaType;
import lombok.Data;

@Data
public class InternalNewSchema {
    private String schema;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private SchemaType schemaType;

    public InternalNewSchema(NewSchemaSubject schemaSubject) {
        this.schema = schemaSubject.getSchema();
        this.schemaType = schemaSubject.getSchemaType();
    }
}
