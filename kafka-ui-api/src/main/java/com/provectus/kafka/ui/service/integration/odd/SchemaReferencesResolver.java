package com.provectus.kafka.ui.service.integration.odd;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.provectus.kafka.ui.sr.api.KafkaSrClientApi;
import com.provectus.kafka.ui.sr.model.SchemaReference;
import java.util.List;
import java.util.Optional;
import javax.annotation.Nullable;
import reactor.core.publisher.Mono;

// logic copied from AbstractSchemaProvider:resolveReferences
// https://github.com/confluentinc/schema-registry/blob/fd59613e2c5adf62e36705307f420712e4c8c1ea/client/src/main/java/io/confluent/kafka/schemaregistry/AbstractSchemaProvider.java#L54
class SchemaReferencesResolver {

  private final KafkaSrClientApi client;

  SchemaReferencesResolver(KafkaSrClientApi client) {
    this.client = client;
  }

  Mono<ImmutableMap<String, String>> resolve(List<SchemaReference> refs) {
    return resolveReferences(refs, new Resolving(ImmutableMap.of(), ImmutableSet.of()))
        .map(Resolving::resolved);
  }

  private record Resolving(ImmutableMap<String, String> resolved, ImmutableSet<String> visited) {

    Resolving visit(String name) {
      return new Resolving(resolved, ImmutableSet.<String>builder().addAll(visited).add(name).build());
    }

    Resolving resolve(String ref, String schema) {
      return new Resolving(ImmutableMap.<String, String>builder().putAll(resolved).put(ref, schema).build(), visited);
    }
  }

  private Mono<Resolving> resolveReferences(@Nullable List<SchemaReference> refs, Resolving initState) {
    Mono<Resolving> result = Mono.just(initState);
    for (SchemaReference reference : Optional.ofNullable(refs).orElse(List.of())) {
      result = result.flatMap(state -> {
        if (state.visited().contains(reference.getName())) {
          return Mono.just(state);
        } else {
          final var newState = state.visit(reference.getName());
          return client.getSubjectVersion(reference.getSubject(), String.valueOf(reference.getVersion()), true)
              .flatMap(subj ->
                  resolveReferences(subj.getReferences(), newState)
                      .map(withNewRefs -> withNewRefs.resolve(reference.getName(), subj.getSchema())));
        }
      });
    }
    return result;
  }
}
