package com.provectus.kafka.ui.service.integration.odd;

import static com.google.common.base.Preconditions.checkNotNull;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.provectus.kafka.ui.sr.api.KafkaSrClientApi;
import com.provectus.kafka.ui.sr.model.SchemaReference;
import java.util.List;
import reactor.core.publisher.Mono;

// logic copied from AbstractSchemaProvider:resolveReferences
// https://github.com/confluentinc/schema-registry/blob/fd59613e2c5adf62e36705307f420712e4c8c1ea/client/src/main/java/io/confluent/kafka/schemaregistry/AbstractSchemaProvider.java#L54
class SchemaReferencesResolver {

  private final KafkaSrClientApi client;

  SchemaReferencesResolver(KafkaSrClientApi client) {
    this.client = client;
  }

  Mono<ImmutableMap<String, String>> resolve(List<SchemaReference> references) {
    ImmutableMap<String, String> result = ImmutableMap.of();
    ImmutableSet<String> visited = ImmutableSet.of();
    return resolveReferences(references, result, visited);
  }

  private Mono<ImmutableMap<String, String>> resolveReferences(List<SchemaReference> references,
                                                               ImmutableMap<String, String> inputSchemas,
                                                               ImmutableSet<String> visited) {
    if (references == null || references.isEmpty()) {
      return Mono.just(inputSchemas);
    }

    Mono<ImmutableMap<String, String>> result = Mono.just(inputSchemas);
    for (SchemaReference reference : references) {
      if (!visited.contains(reference.getName())) {
        visited = ImmutableSet.<String>builder().addAll(visited).add(reference.getName()).build();
        final ImmutableSet<String> finalVisited = visited;
        result = result.flatMap(registeredSchemas ->
            client.getSubjectVersion(reference.getSubject(), String.valueOf(reference.getVersion()), true)
                .flatMap(subj -> {
                  checkNotNull(subj.getSchema(), "Subject '%s' schema is null", subj.getSubject());
                  if (registeredSchemas.containsKey(reference.getName())) {
                    return Mono.just(registeredSchemas);
                  }
                  return resolveReferences(subj.getReferences(), registeredSchemas, finalVisited)
                      .map(updated -> ImmutableMap.<String, String>builder()
                          .putAll(updated)
                          .put(reference.getName(), subj.getSchema())
                          .build());
                }));
      }
    }
    return result;
  }

}
