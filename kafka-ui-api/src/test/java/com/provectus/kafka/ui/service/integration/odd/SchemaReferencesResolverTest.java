package com.provectus.kafka.ui.service.integration.odd;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.google.common.collect.ImmutableMap;
import com.provectus.kafka.ui.sr.api.KafkaSrClientApi;
import com.provectus.kafka.ui.sr.model.SchemaReference;
import com.provectus.kafka.ui.sr.model.SchemaSubject;
import java.util.List;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class SchemaReferencesResolverTest {

  private final KafkaSrClientApi srClientMock = mock(KafkaSrClientApi.class);

  private final SchemaReferencesResolver schemaReferencesResolver = new SchemaReferencesResolver(srClientMock);

  @Test
  void resolvesRefsUsingSrClient() {
    mockSrCall("sub1", 1,
        new SchemaSubject()
            .schema("schema1"));

    mockSrCall("sub2", 1,
        new SchemaSubject()
            .schema("schema2")
            .references(
                List.of(
                    new SchemaReference().name("ref2_1").subject("sub2_1").version(2),
                    new SchemaReference().name("ref2_2").subject("sub1").version(1))));

    mockSrCall("sub2_1", 2,
        new SchemaSubject()
            .schema("schema2_1")
            .references(
                List.of(
                    new SchemaReference().name("ref2_1_1").subject("sub2_1_1").version(3),
                    new SchemaReference().name("ref1").subject("should_not_be_called").version(1)
                ))
    );

    mockSrCall("sub2_1_1", 3,
        new SchemaSubject()
            .schema("schema2_1_1"));

    var resolvedRefsMono = schemaReferencesResolver.resolve(
        List.of(
            new SchemaReference().name("ref1").subject("sub1").version(1),
            new SchemaReference().name("ref2").subject("sub2").version(1)));

    StepVerifier.create(resolvedRefsMono)
        .assertNext(refs ->
            assertThat(refs)
                .containsExactlyEntriesOf(
                    // checking map should be ordered
                    ImmutableMap.<String, String>builder()
                        .put("ref1", "schema1")
                        .put("ref2_1_1", "schema2_1_1")
                        .put("ref2_1", "schema2_1")
                        .put("ref2_2", "schema1")
                        .put("ref2", "schema2")
                        .build()))
        .verifyComplete();
  }

  @Test
  void returnsEmptyMapOnEmptyInputs() {
    StepVerifier.create(schemaReferencesResolver.resolve(null))
        .assertNext(map -> assertThat(map).isEmpty())
        .verifyComplete();

    StepVerifier.create(schemaReferencesResolver.resolve(List.of()))
        .assertNext(map -> assertThat(map).isEmpty())
        .verifyComplete();
  }

  private void mockSrCall(String subject, int version, SchemaSubject subjectToReturn) {
    when(srClientMock.getSubjectVersion(subject, version + "", true))
        .thenReturn(Mono.just(subjectToReturn));
  }

}
