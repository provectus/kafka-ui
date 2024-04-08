package com.provectus.kafka.ui.service.integration.odd;

import com.provectus.kafka.ui.model.ConnectorTypeDTO;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddrn.JdbcUrlParser;
import org.opendatadiscovery.oddrn.model.HivePath;
import org.opendatadiscovery.oddrn.model.MysqlPath;
import org.opendatadiscovery.oddrn.model.PostgreSqlPath;
import org.opendatadiscovery.oddrn.model.SnowflakePath;

record ConnectorInfo(List<String> inputs,
                     List<String> outputs) {

  static ConnectorInfo extract(String className,
                               ConnectorTypeDTO type,
                               Map<String, Object> config,
                               List<String> topicsFromApi, // can be empty for old Connect API versions
                               Function<String, String> topicOddrnBuilder) {
    return switch (className) {
      case "org.apache.kafka.connect.file.FileStreamSinkConnector",
          "org.apache.kafka.connect.file.FileStreamSourceConnector",
          "FileStreamSource",
          "FileStreamSink" -> extractFileIoConnector(type, topicsFromApi, config, topicOddrnBuilder);
      case "io.confluent.connect.s3.S3SinkConnector" -> extractS3Sink(type, topicsFromApi, config, topicOddrnBuilder);
      case "io.confluent.connect.jdbc.JdbcSinkConnector" ->
          extractJdbcSink(type, topicsFromApi, config, topicOddrnBuilder);
      case "io.debezium.connector.postgresql.PostgresConnector" -> extractDebeziumPg(config);
      case "io.debezium.connector.mysql.MySqlConnector" -> extractDebeziumMysql(config);
      default -> new ConnectorInfo(
          extractInputs(type, topicsFromApi, config, topicOddrnBuilder),
          extractOutputs(type, topicsFromApi, config, topicOddrnBuilder)
      );
    };
  }

  private static ConnectorInfo extractFileIoConnector(ConnectorTypeDTO type,
                                                      List<String> topics,
                                                      Map<String, Object> config,
                                                      Function<String, String> topicOddrnBuilder) {
    return new ConnectorInfo(
        extractInputs(type, topics, config, topicOddrnBuilder),
        extractOutputs(type, topics, config, topicOddrnBuilder)
    );
  }

  private static ConnectorInfo extractJdbcSink(ConnectorTypeDTO type,
                                               List<String> topics,
                                               Map<String, Object> config,
                                               Function<String, String> topicOddrnBuilder) {
    String tableNameFormat = (String) config.getOrDefault("table.name.format", "${topic}");
    List<String> targetTables = extractTopicNamesBestEffort(topics, config)
        .map(topic -> tableNameFormat.replace("${kafka}", topic))
        .toList();

    String connectionUrl = (String) config.get("connection.url");
    List<String> outputs = new ArrayList<>();
    @Nullable var knownJdbcPath = new JdbcUrlParser().parse(connectionUrl);
    if (knownJdbcPath instanceof PostgreSqlPath p) {
      targetTables.forEach(t -> outputs.add(p.toBuilder().table(t).build().oddrn()));
    }
    if (knownJdbcPath instanceof MysqlPath p) {
      targetTables.forEach(t -> outputs.add(p.toBuilder().table(t).build().oddrn()));
    }
    if (knownJdbcPath instanceof HivePath p) {
      targetTables.forEach(t -> outputs.add(p.toBuilder().table(t).build().oddrn()));
    }
    if (knownJdbcPath instanceof SnowflakePath p) {
      targetTables.forEach(t -> outputs.add(p.toBuilder().table(t).build().oddrn()));
    }
    return new ConnectorInfo(
        extractInputs(type, topics, config, topicOddrnBuilder),
        outputs
    );
  }

  private static ConnectorInfo extractDebeziumPg(Map<String, Object> config) {
    String host = (String) config.get("database.hostname");
    String dbName = (String) config.get("database.dbname");
    var inputs = List.of(
        PostgreSqlPath.builder()
            .host(host)
            .database(dbName)
            .build().oddrn()
    );
    return new ConnectorInfo(inputs, List.of());
  }

  private static ConnectorInfo extractDebeziumMysql(Map<String, Object> config) {
    String host = (String) config.get("database.hostname");
    var inputs = List.of(
        MysqlPath.builder()
            .host(host)
            .build()
            .oddrn()
    );
    return new ConnectorInfo(inputs, List.of());
  }

  private static ConnectorInfo extractS3Sink(ConnectorTypeDTO type,
                                             List<String> topics,
                                             Map<String, Object> config,
                                             Function<String, String> topicOrrdnBuilder) {
    String bucketName = (String) config.get("s3.bucket.name");
    String topicsDir = (String) config.getOrDefault("topics.dir", "topics");
    String directoryDelim = (String) config.getOrDefault("directory.delim", "/");
    List<String> outputs = extractTopicNamesBestEffort(topics, config)
        .map(topic -> Oddrn.awsS3Oddrn(bucketName, topicsDir + directoryDelim + topic))
        .toList();
    return new ConnectorInfo(
        extractInputs(type, topics, config, topicOrrdnBuilder),
        outputs
    );
  }

  private static List<String> extractInputs(ConnectorTypeDTO type,
                                            List<String> topicsFromApi,
                                            Map<String, Object> config,
                                            Function<String, String> topicOrrdnBuilder) {
    return type == ConnectorTypeDTO.SINK
        ? extractTopicsOddrns(config, topicsFromApi, topicOrrdnBuilder)
        : List.of();
  }

  private static List<String> extractOutputs(ConnectorTypeDTO type,
                                             List<String> topicsFromApi,
                                             Map<String, Object> config,
                                             Function<String, String> topicOrrdnBuilder) {
    return type == ConnectorTypeDTO.SOURCE
        ? extractTopicsOddrns(config, topicsFromApi, topicOrrdnBuilder)
        : List.of();
  }

  private static Stream<String> extractTopicNamesBestEffort(
      // topic list can be empty for old Connect API versions
      List<String> topicsFromApi,
      Map<String, Object> config
  ) {
    if (CollectionUtils.isNotEmpty(topicsFromApi)) {
      return topicsFromApi.stream();
    }

    // trying to extract topic names from config
    String topicsString = (String) config.get("topics");
    String topicString = (String) config.get("topic");
    return Stream.of(topicsString, topicString)
        .filter(Objects::nonNull)
        .flatMap(str -> Stream.of(str.split(",")))
        .map(String::trim)
        .filter(s -> !s.isBlank());
  }

  private static List<String> extractTopicsOddrns(Map<String, Object> config,
                                                  List<String> topicsFromApi,
                                                  Function<String, String> topicOrrdnBuilder) {
    return extractTopicNamesBestEffort(topicsFromApi, config)
        .map(topicOrrdnBuilder)
        .toList();
  }

}
