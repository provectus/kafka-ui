package com.provectus.kafka.ui.service.integration.odd;

import static com.google.common.base.Preconditions.checkNotNull;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import com.provectus.kafka.ui.sr.api.KafkaSrClientApi;
import com.provectus.kafka.ui.sr.model.SchemaReference;
import java.util.List;
import java.util.Optional;
import reactor.core.publisher.Mono;

// logic copied from AbstractSchemaProvider:resolveReferences
// https://github.com/confluentinc/schema-registry/blob/fd59613e2c5adf62e36705307f420712e4c8c1ea/client/src/main/java/io/confluent/kafka/schemaregistry/AbstractSchemaProvider.java#L54
class SchemaReferencesResolver {

  private final KafkaSrClientApi client;

  SchemaReferencesResolver(KafkaSrClientApi client) {
    this.client = client;
  }

  Mono<ImmutableMap<String, String>> resolve(List<SchemaReference> references) {
    return resolveReferences(references, new State(ImmutableMap.of(), ImmutableSet.of()))
        .map(State::resolved);
  }

  private record State(ImmutableMap<String, String> resolved, ImmutableSet<String> visited) {

    State visit(String name) {
      return new State(resolved, ImmutableSet.<String>builder().addAll(visited).add(name).build());
    }

    State resolve(String ref, String schema) {
      return new State(ImmutableMap.<String, String>builder().putAll(resolved).put(ref, schema).build(), visited);
    }
  }

  private Mono<State> resolveReferences(List<SchemaReference> references,
                                        State initState) {
    Mono<State> result = Mono.just(initState);
    for (var reference : Optional.ofNullable(references).orElse(List.of())) {
      result = result.flatMap(state -> {
            if (state.visited().contains(reference.getName())) {
              return Mono.just(state);
            } else {
              final var newState = state.visit(reference.getName());
              return client.getSubjectVersion(reference.getSubject(), String.valueOf(reference.getVersion()), true)
                  .flatMap(subj ->
                      resolveReferences(subj.getReferences(), newState)
                          .map(withNewRefs -> withNewRefs.resolve(reference.getName(), subj.getSchema()))
                  );
            }
          }
      );
    }
    return result;
  }

}
