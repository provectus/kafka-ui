package com.provectus.kafka.ui.service.ksql;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.KsqlStreamDescriptionDTO;
import com.provectus.kafka.ui.model.KsqlTableDescriptionDTO;
import com.provectus.kafka.ui.util.ReactiveFailover;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class KsqlServiceV2Test extends AbstractIntegrationTest {

  private static final Set<String> STREAMS_TO_DELETE = new CopyOnWriteArraySet<>();
  private static final Set<String> TABLES_TO_DELETE = new CopyOnWriteArraySet<>();

  @BeforeAll
  static void init() {
    KSQL_DB.start();
  }

  @AfterAll
  static void cleanup() {
    TABLES_TO_DELETE.forEach(t ->
        ksqlClient().execute(String.format("DROP TABLE IF EXISTS %s DELETE TOPIC;", t), Map.of())
            .blockLast());

    STREAMS_TO_DELETE.forEach(s ->
        ksqlClient().execute(String.format("DROP STREAM IF EXISTS %s DELETE TOPIC;", s), Map.of())
            .blockLast());

    KSQL_DB.stop();
  }

  private final KsqlServiceV2 ksqlService = new KsqlServiceV2();

  @Test
  void listStreamsReturnsAllKsqlStreams() {
    var streamName = "stream_" + System.currentTimeMillis();
    STREAMS_TO_DELETE.add(streamName);

    ksqlClient()
        .execute(
            String.format("CREATE STREAM %s ( "
                + "  c1 BIGINT KEY, "
                + "  c2 VARCHAR "
                + " ) WITH ( "
                + "  KAFKA_TOPIC = '%s_topic', "
                + "  PARTITIONS = 1, "
                + "  VALUE_FORMAT = 'JSON' "
                + " );", streamName, streamName),
            Map.of())
        .blockLast();

    var streams = ksqlService.listStreams(cluster()).collectList().block();
    assertThat(streams).contains(
        new KsqlStreamDescriptionDTO()
            .name(streamName.toUpperCase())
            .topic(streamName + "_topic")
            .keyFormat("KAFKA")
            .valueFormat("JSON")
    );
  }

  @Test
  void listTablesReturnsAllKsqlTables() {
    var tableName = "table_" + System.currentTimeMillis();
    TABLES_TO_DELETE.add(tableName);

    ksqlClient()
        .execute(
            String.format("CREATE TABLE %s ( "
                + "   c1 BIGINT PRIMARY KEY, "
                + "   c2 VARCHAR "
                + " ) WITH ( "
                + "  KAFKA_TOPIC = '%s_topic', "
                + "  PARTITIONS = 1, "
                + "  VALUE_FORMAT = 'JSON' "
                + " );", tableName, tableName),
            Map.of())
        .blockLast();

    var tables = ksqlService.listTables(cluster()).collectList().block();
    assertThat(tables).contains(
        new KsqlTableDescriptionDTO()
            .name(tableName.toUpperCase())
            .topic(tableName + "_topic")
            .keyFormat("KAFKA")
            .valueFormat("JSON")
            .isWindowed(false)
    );
  }

  private static KafkaCluster cluster() {
    return KafkaCluster.builder()
        .ksqlClient(ReactiveFailover.create(
            List.of(ksqlClient()), th -> true, "", ReactiveFailover.DEFAULT_RETRY_GRACE_PERIOD_MS))
        .build();
  }

  private static KsqlApiClient ksqlClient() {
    return new KsqlApiClient(KSQL_DB.url(), null, null, null, null);
  }

}
