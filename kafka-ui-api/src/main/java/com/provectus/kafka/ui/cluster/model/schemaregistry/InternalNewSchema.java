package com.provectus.kafka.ui.cluster.model.schemaregistry;

import com.provectus.kafka.ui.model.NewSchemaSubject;
import lombok.Data;

@Data
public class InternalNewSchema {
    private String schema;

    public InternalNewSchema(NewSchemaSubject schemaSubject) {
        this.schema = schemaSubject.getSchema();
    }
}
