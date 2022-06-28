package com.provectus.kafka.ui.service.ksql;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.container.KsqlDbContainer;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.KsqlStreamDescriptionDTO;
import com.provectus.kafka.ui.model.KsqlTableDescriptionDTO;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.util.unit.DataSize;
import org.testcontainers.utility.DockerImageName;

class KsqlServiceV2Test extends AbstractIntegrationTest {

  private static final KsqlDbContainer KSQL_DB = new KsqlDbContainer(
      DockerImageName.parse("confluentinc/ksqldb-server").withTag("0.24.0"))
      .withKafka(kafka);

  private static final Set<String> STREAMS_TO_DELETE = new CopyOnWriteArraySet<>();
  private static final Set<String> TABLES_TO_DELETE = new CopyOnWriteArraySet<>();

  private static final DataSize maxBuffSize = DataSize.ofMegabytes(20);

  @BeforeAll
  static void init() {
    KSQL_DB.start();
  }

  @AfterAll
  static void cleanup() {
    var client = new KsqlApiClient(KafkaCluster.builder().ksqldbServer(KSQL_DB.url()).build(), maxBuffSize);

    TABLES_TO_DELETE.forEach(t ->
        client.execute(String.format("DROP TABLE IF EXISTS %s DELETE TOPIC;", t), Map.of())
            .blockLast());

    STREAMS_TO_DELETE.forEach(s ->
        client.execute(String.format("DROP STREAM IF EXISTS %s DELETE TOPIC;", s), Map.of())
            .blockLast());

    KSQL_DB.stop();
  }

  private final KsqlServiceV2 ksqlService = new KsqlServiceV2(maxBuffSize);

  @Test
  void listStreamsReturnsAllKsqlStreams() {
    var cluster = KafkaCluster.builder().ksqldbServer(KSQL_DB.url()).build();
    var streamName = "stream_" + System.currentTimeMillis();
    STREAMS_TO_DELETE.add(streamName);

    new KsqlApiClient(cluster, maxBuffSize)
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

    var streams = ksqlService.listStreams(cluster).collectList().block();
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
    var cluster = KafkaCluster.builder().ksqldbServer(KSQL_DB.url()).build();
    var tableName = "table_" + System.currentTimeMillis();
    TABLES_TO_DELETE.add(tableName);

    new KsqlApiClient(cluster, maxBuffSize)
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

    var tables = ksqlService.listTables(cluster).collectList().block();
    assertThat(tables).contains(
        new KsqlTableDescriptionDTO()
            .name(tableName.toUpperCase())
            .topic(tableName + "_topic")
            .keyFormat("KAFKA")
            .valueFormat("JSON")
            .isWindowed(false)
    );
  }

}
