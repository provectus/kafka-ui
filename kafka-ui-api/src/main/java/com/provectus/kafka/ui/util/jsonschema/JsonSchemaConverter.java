package com.provectus.kafka.ui.util.jsonschema;

import java.net.URI;

public interface JsonSchemaConverter<T> {
  JsonSchema convert(URI basePath, T schema);
}
