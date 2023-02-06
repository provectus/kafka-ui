package com.provectus.kafka.ui.service.integration.odd;

import com.provectus.kafka.ui.model.ConnectorTypeDTO;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import org.opendatadiscovery.oddrn.JdbcUrlParser;
import org.opendatadiscovery.oddrn.model.HivePath;
import org.opendatadiscovery.oddrn.model.MysqlPath;
import org.opendatadiscovery.oddrn.model.PostgreSqlPath;
import org.opendatadiscovery.oddrn.model.SnowflakePath;

record ConnectorInfo(Map<String, Object> metadata,
                     List<String> inputs,
                     List<String> outputs) {

  static ConnectorInfo extract(String className,
                               ConnectorTypeDTO type,
                               Map<String, Object> config,
                               Function<String, String> topicOddrnBuilder) {
    return switch (className) {
      case "org.apache.kafka.connect.file.FileStreamSinkConnector",
          "org.apache.kafka.connect.file.FileStreamSourceConnector",
          "FileStreamSource",
          "FileStreamSink" -> extractFileIoConnector(className, type, config, topicOddrnBuilder);
      case "io.confluent.connect.s3.S3SinkConnector" -> extractS3Sink(className, type, config, topicOddrnBuilder);
      case "io.confluent.connect.jdbc.JdbcSinkConnector" -> extractJdbcSink(className, type, config, topicOddrnBuilder);
      case "io.debezium.connector.postgresql.PostgresConnector" -> extractDebeziumPg(className, type, config);
      case "io.debezium.connector.mysql.MySqlConnector" -> extractDebeziumMysql(className, type, config);
      default -> new ConnectorInfo(
          buildMetadata(className, type, config),
          extractInputs(type, config, topicOddrnBuilder),
          extractOutputs(type, config, topicOddrnBuilder)
      );
    };
  }

  private static ConnectorInfo extractFileIoConnector(String className,
                                                      ConnectorTypeDTO type,
                                                      Map<String, Object> config,
                                                      Function<String, String> topicOddrnBuilder) {
    return new ConnectorInfo(
        buildMetadata(className, type, config, "file"),
        extractInputs(type, config, topicOddrnBuilder),
        extractOutputs(type, config, topicOddrnBuilder)
    );
  }

  private static ConnectorInfo extractJdbcSink(String className,
                                               ConnectorTypeDTO type,
                                               Map<String, Object> config,
                                               Function<String, String> topicOddrnBuilder) {
    String tableNameFormat = (String) config.getOrDefault("table.name.format", "${topic}");
    List<String> targetTables = extractTopicNames(config)
        .map(topic -> tableNameFormat.replace("${kafka}", topic))
        .toList();

    String connectionUrl = (String) config.get("connection.url");
    List<String> outputs = new ArrayList<>();
    @Nullable var knownJdbcPath = new JdbcUrlParser().parse(connectionUrl);
    if (knownJdbcPath instanceof PostgreSqlPath p) {
      targetTables.forEach(t -> outputs.add(Oddrn.generateOddrn(p.toBuilder().table(t).build(), "table")));
    }
    if (knownJdbcPath instanceof MysqlPath p) {
      targetTables.forEach(t -> outputs.add(Oddrn.generateOddrn(p.toBuilder().table(t).build(), "table")));
    }
    if (knownJdbcPath instanceof HivePath p) {
      targetTables.forEach(t -> outputs.add(Oddrn.generateOddrn(p.toBuilder().table(t).build(), "table")));
    }
    if (knownJdbcPath instanceof SnowflakePath p) {
      targetTables.forEach(t -> outputs.add(Oddrn.generateOddrn(p.toBuilder().table(t).build(), "table")));
    }
    //TODO add generic jdbc implementation
    return new ConnectorInfo(
        buildMetadata(className, type, config, "connection.url", "auto.create"),
        extractInputs(type, config, topicOddrnBuilder),
        outputs
    );
  }

  private static ConnectorInfo extractDebeziumPg(String className,
                                                 ConnectorTypeDTO type,
                                                 Map<String, Object> config) {
    String host = (String) config.get("database.hostname");
    String port = (String) config.getOrDefault("database.port", "5432");
    String dbName = (String) config.get("database.dbname");
    var inputs = List.of(
        Oddrn.generateOddrn(
            PostgreSqlPath.builder()
                .host(host + ":" + port)
                .database(dbName)
                .build(),
            "database"
        )
    );

    return new ConnectorInfo(
        buildMetadata(className, type, config, "database.hostname", "database.port", "snapshot.mode",
            "table.include.list", "table.exclude.list", "schema.include.list", "schema.exclude.list"),
        inputs,
        //TODO[discuss]: there is no topic list in debezium, sometimes it can be inferred from topics.include
        // but still not clear what schema to set for such topics
        List.of()
    );
  }

  private static ConnectorInfo extractDebeziumMysql(String className,
                                                    ConnectorTypeDTO type,
                                                    Map<String, Object> config) {
    String host = (String) config.get("database.hostname");
    String port = (String) config.getOrDefault("database.port", "3306");
    var inputs = List.of(
        Oddrn.generateOddrn(
            MysqlPath.builder()
                .host(host + ":" + port)
                .build(),
            "database"
        )
    );
    return new ConnectorInfo(
        buildMetadata(className, type, config, "database.hostname", "database.port",
            "database.include.list", "database.exclude.list", "table.include.list", "table.exclude.list"),
        inputs,
        List.of()
    );
  }

  private static ConnectorInfo extractS3Sink(String className,
                                             ConnectorTypeDTO type,
                                             Map<String, Object> config,
                                             Function<String, String> topicOrrdnBuilder) {
    String bucketName = (String) config.get("s3.bucket.name");
    String topicsDir = (String) config.getOrDefault("topics.dir", "topics");
    String directoryDelim = (String) config.getOrDefault("directory.delim", "/");
    List<String> outputs = extractTopicNames(config)
        .map(topic -> Oddrn.awsS3Oddrn(bucketName, topicsDir + directoryDelim + topic))
        .toList();
    return new ConnectorInfo(
        buildMetadata(
            className,
            type,
            config,
            "s3.bucket.name", "s3.region", "store.url",
            "format.class", "partitioner.class", "partition.field.name"
        ),
        extractInputs(type, config, topicOrrdnBuilder),
        outputs
    );
  }

  private static Map<String, Object> buildMetadata(
      String className,
      ConnectorTypeDTO type,
      Map<String, Object> config,
      String... propertyNames
  ) {
    var meta = new HashMap<String, Object>();
    meta.put("type", type.name());
    meta.put("class", className);
    for (String propertyName : propertyNames) {
      if (config.containsKey(propertyName)) {
        meta.put(propertyName, config.get(propertyName));
      }
    }
    return meta;
  }

  private static List<String> extractInputs(ConnectorTypeDTO type, Map<String, Object> config,
                                            Function<String, String> topicOrrdnBuilder) {
    return type == ConnectorTypeDTO.SINK
        ? extractTopicsOddrns(config, topicOrrdnBuilder)
        : List.of();
  }

  private static List<String> extractOutputs(ConnectorTypeDTO type, Map<String, Object> config,
                                             Function<String, String> topicOrrdnBuilder) {
    return type == ConnectorTypeDTO.SOURCE
        ? extractTopicsOddrns(config, topicOrrdnBuilder)
        : List.of();
  }

  private static Stream<String> extractTopicNames(Map<String, Object> config) {
    String topicsString = (String) config.get("topics");
    String topicString = (String) config.get("topic");
    return Stream.of(topicsString, topicString)
        .filter(Objects::nonNull)
        .flatMap(str -> Stream.of(str.split(",")))
        .map(String::trim)
        .filter(s -> !s.isBlank());
  }

  private static List<String> extractTopicsOddrns(Map<String, Object> config,
                                                  Function<String, String> topicOrrdnBuilder) {
    return extractTopicNames(config)
        .map(topicOrrdnBuilder)
        .toList();
  }

}
