package com.provectus.kafka.ui.service.audit;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.provectus.kafka.ui.config.auth.AuthenticatedUser;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.AccessContext.AccessContextBuilder;
import com.provectus.kafka.ui.model.rbac.permission.AclAction;
import com.provectus.kafka.ui.model.rbac.permission.ClusterConfigAction;
import com.provectus.kafka.ui.model.rbac.permission.ConnectAction;
import com.provectus.kafka.ui.model.rbac.permission.ConsumerGroupAction;
import com.provectus.kafka.ui.model.rbac.permission.SchemaAction;
import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import java.util.List;
import java.util.function.UnaryOperator;
import java.util.stream.Stream;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mockito;
import org.slf4j.Logger;

class AuditWriterTest {

  final KafkaProducer<byte[], byte[]> producerMock = Mockito.mock(KafkaProducer.class);
  final Logger loggerMock = Mockito.mock(Logger.class);
  final AuthenticatedUser user = new AuthenticatedUser("someone", List.of());

  @Nested
  class AlterOperationsOnlyWriter {

    final AuditWriter alterOnlyWriter = new AuditWriter("test", true, "test-topic", producerMock, loggerMock);

    @ParameterizedTest
    @MethodSource
    void onlyLogsWhenAlterOperationIsPresentForOneOfResources(AccessContext ctxWithAlterOperation) {
      alterOnlyWriter.write(ctxWithAlterOperation, user, null);
      verify(producerMock).send(any(), any());
      verify(loggerMock).info(any());
    }

    static Stream<AccessContext> onlyLogsWhenAlterOperationIsPresentForOneOfResources() {
      Stream<UnaryOperator<AccessContextBuilder>> topicEditActions =
          TopicAction.ALTER_ACTIONS.stream().map(a -> c -> c.topic("test").topicActions(a));
      Stream<UnaryOperator<AccessContextBuilder>> clusterConfigEditActions =
          ClusterConfigAction.ALTER_ACTIONS.stream().map(a -> c -> c.clusterConfigActions(a));
      Stream<UnaryOperator<AccessContextBuilder>> aclEditActions =
          AclAction.ALTER_ACTIONS.stream().map(a -> c -> c.aclActions(a));
      Stream<UnaryOperator<AccessContextBuilder>> cgEditActions =
          ConsumerGroupAction.ALTER_ACTIONS.stream().map(a -> c -> c.consumerGroup("cg").consumerGroupActions(a));
      Stream<UnaryOperator<AccessContextBuilder>> schemaEditActions =
          SchemaAction.ALTER_ACTIONS.stream().map(a -> c -> c.schema("sc").schemaActions(a));
      Stream<UnaryOperator<AccessContextBuilder>> connEditActions =
          ConnectAction.ALTER_ACTIONS.stream().map(a -> c -> c.connect("conn").connectActions(a));
      return Stream.of(
              topicEditActions, clusterConfigEditActions, aclEditActions,
              cgEditActions, connEditActions, schemaEditActions
          )
          .flatMap(c -> c)
          .map(setter -> setter.apply(AccessContext.builder().cluster("test").operationName("test")).build());
    }

    @ParameterizedTest
    @MethodSource
    void doesNothingIfNoResourceHasAlterAction(AccessContext readOnlyCxt) {
      alterOnlyWriter.write(readOnlyCxt, user, null);
      verifyNoInteractions(producerMock);
      verifyNoInteractions(loggerMock);
    }

    static Stream<AccessContext> doesNothingIfNoResourceHasAlterAction() {
      return Stream.<UnaryOperator<AccessContextBuilder>>of(
          c -> c.topic("test").topicActions(TopicAction.VIEW),
          c -> c.clusterConfigActions(ClusterConfigAction.VIEW),
          c -> c.aclActions(AclAction.VIEW),
          c -> c.consumerGroup("cg").consumerGroupActions(ConsumerGroupAction.VIEW),
          c -> c.schema("sc").schemaActions(SchemaAction.VIEW),
          c -> c.connect("conn").connectActions(ConnectAction.VIEW)
      ).map(setter -> setter.apply(AccessContext.builder().cluster("test").operationName("test")).build());
    }
  }

}
