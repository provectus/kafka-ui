package com.provectus.kafka.ui.service.ksql;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.DoubleNode;
import com.fasterxml.jackson.databind.node.IntNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.TextNode;
import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.container.KsqlDbContainer;
import com.provectus.kafka.ui.model.InternalKsqlServer;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.util.unit.DataSize;
import org.testcontainers.shaded.org.awaitility.Awaitility;
import org.testcontainers.utility.DockerImageName;
import reactor.test.StepVerifier;

class KsqlApiClientTest extends AbstractIntegrationTest {

  private static final KsqlDbContainer KSQL_DB = new KsqlDbContainer(
      DockerImageName.parse("confluentinc/ksqldb-server").withTag("0.24.0"))
      .withKafka(kafka);

  private static final DataSize maxBuffSize = DataSize.ofMegabytes(20);

  @BeforeAll
  static void startContainer() {
    KSQL_DB.start();
  }

  @AfterAll
  static void stopContainer() {
    KSQL_DB.stop();
  }

  // Tutorial is here: https://ksqldb.io/quickstart.html
  @Test
  void ksqTutorialQueriesWork() {
    var client = new KsqlApiClient(KafkaCluster.builder().ksqldbServer(
            InternalKsqlServer.builder().url(KSQL_DB.url()).build()).build(), maxBuffSize);
    execCommandSync(client,
        "CREATE STREAM riderLocations (profileId VARCHAR, latitude DOUBLE, longitude DOUBLE) "
            + "WITH (kafka_topic='locations', value_format='json', partitions=1);",
        "CREATE TABLE currentLocation AS "
            + "  SELECT profileId, "
            + "         LATEST_BY_OFFSET(latitude) AS la, "
            + "         LATEST_BY_OFFSET(longitude) AS lo "
            + "  FROM riderlocations "
            + "  GROUP BY profileId "
            + "  EMIT CHANGES;",
        "CREATE TABLE ridersNearMountainView AS "
            + "  SELECT ROUND(GEO_DISTANCE(la, lo, 37.4133, -122.1162), -1) AS distanceInMiles, "
            + "         COLLECT_LIST(profileId) AS riders, "
            + "         COUNT(*) AS count "
            + "  FROM currentLocation "
            + "  GROUP BY ROUND(GEO_DISTANCE(la, lo, 37.4133, -122.1162), -1);",
        "INSERT INTO riderLocations (profileId, latitude, longitude) VALUES ('c2309eec', 37.7877, -122.4205); ",
        "INSERT INTO riderLocations (profileId, latitude, longitude) VALUES ('18f4ea86', 37.3903, -122.0643); ",
        "INSERT INTO riderLocations (profileId, latitude, longitude) VALUES ('4ab5cbad', 37.3952, -122.0813); ",
        "INSERT INTO riderLocations (profileId, latitude, longitude) VALUES ('8b6eae59', 37.3944, -122.0813); ",
        "INSERT INTO riderLocations (profileId, latitude, longitude) VALUES ('4a7c7b41', 37.4049, -122.0822); ",
        "INSERT INTO riderLocations (profileId, latitude, longitude) VALUES ('4ddad000', 37.7857, -122.4011);"
    );

    Awaitility.await()
        .pollDelay(Duration.ofSeconds(1))
        .atMost(Duration.ofSeconds(20))
        .untilAsserted(() -> assertLastKsqTutorialQueryResult(client));
  }

  private void assertLastKsqTutorialQueryResult(KsqlApiClient client) {
    // expected results:
    //{"header":"Schema","columnNames":[...],"values":null}
    //{"header":"Row","columnNames":null,"values":[[0.0,["4ab5cbad","8b6eae59","4a7c7b41"],3]]}
    //{"header":"Row","columnNames":null,"values":[[10.0,["18f4ea86"],1]]}
    StepVerifier.create(
            client.execute(
                "SELECT * from ridersNearMountainView WHERE distanceInMiles <= 10;",
                Map.of()
            )
        )
        .assertNext(header -> {
          assertThat(header.getHeader()).isEqualTo("Schema");
          assertThat(header.getColumnNames()).hasSize(3);
          assertThat(header.getValues()).isNull();
        })
        .assertNext(row -> {
          assertThat(row).isEqualTo(
              KsqlApiClient.KsqlResponseTable.builder()
                  .header("Row")
                  .columnNames(null)
                  .values(List.of(List.of(
                      new DoubleNode(0.0),
                      new ArrayNode(JsonNodeFactory.instance)
                          .add(new TextNode("4ab5cbad"))
                          .add(new TextNode("8b6eae59"))
                          .add(new TextNode("4a7c7b41")),
                      new IntNode(3)
                  )))
                  .build()
          );
        })
        .assertNext(row -> {
          assertThat(row).isEqualTo(
              KsqlApiClient.KsqlResponseTable.builder()
                  .header("Row")
                  .columnNames(null)
                  .values(List.of(List.of(
                      new DoubleNode(10.0),
                      new ArrayNode(JsonNodeFactory.instance)
                          .add(new TextNode("18f4ea86")),
                      new IntNode(1)
                  )))
                  .build()
          );
        })
        .verifyComplete();
  }

  private void execCommandSync(KsqlApiClient client, String... ksqls) {
    for (String ksql : ksqls) {
      client.execute(ksql, Map.of()).collectList().block();
    }
  }


}
