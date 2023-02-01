package com.provectus.kafka.ui.services;

import static com.codeborne.selenide.Selenide.sleep;
import static com.provectus.kafka.ui.utilities.FileUtils.fileToString;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.api.ApiClient;
import com.provectus.kafka.ui.api.api.KafkaConnectApi;
import com.provectus.kafka.ui.api.api.KsqlApi;
import com.provectus.kafka.ui.api.api.MessagesApi;
import com.provectus.kafka.ui.api.api.SchemasApi;
import com.provectus.kafka.ui.api.api.TopicsApi;
import com.provectus.kafka.ui.api.model.CreateTopicMessage;
import com.provectus.kafka.ui.api.model.KsqlCommandV2;
import com.provectus.kafka.ui.api.model.KsqlCommandV2Response;
import com.provectus.kafka.ui.api.model.KsqlResponse;
import com.provectus.kafka.ui.api.model.NewConnector;
import com.provectus.kafka.ui.api.model.NewSchemaSubject;
import com.provectus.kafka.ui.api.model.TopicCreation;
import com.provectus.kafka.ui.models.Connector;
import com.provectus.kafka.ui.models.Schema;
import com.provectus.kafka.ui.models.Topic;
import com.provectus.kafka.ui.pages.ksqldb.models.Stream;
import com.provectus.kafka.ui.pages.ksqldb.models.Table;
import com.provectus.kafka.ui.settings.BaseSource;
import io.qameta.allure.Step;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.reactive.function.client.WebClientResponseException;


@Slf4j
public class ApiService extends BaseSource {

    @SneakyThrows
    private TopicsApi topicApi() {
      return new TopicsApi(new ApiClient().setBasePath(BASE_LOCAL_URL));
    }

    @SneakyThrows
    private SchemasApi schemaApi() {
      return new SchemasApi(new ApiClient().setBasePath(BASE_LOCAL_URL));
    }

    @SneakyThrows
    private KafkaConnectApi connectorApi() {
      return new KafkaConnectApi(new ApiClient().setBasePath(BASE_LOCAL_URL));
    }

    @SneakyThrows
    private MessagesApi messageApi() {
      return new MessagesApi(new ApiClient().setBasePath(BASE_LOCAL_URL));
    }

    @SneakyThrows
    private KsqlApi ksqlApi(){return new KsqlApi(new ApiClient().setBasePath(BASE_LOCAL_URL));}

    @SneakyThrows
    private void createTopic(String clusterName, String topicName) {
      TopicCreation topic = new TopicCreation();
      topic.setName(topicName);
      topic.setPartitions(1);
      topic.setReplicationFactor(1);
      try {
        topicApi().createTopic(clusterName, topic).block();
        sleep(2000);
      } catch (WebClientResponseException ex) {
        ex.printStackTrace();
      }
    }

    @Step
    public ApiService createTopic(String topicName) {
      createTopic(CLUSTER_NAME, topicName);
      return this;
    }

    @SneakyThrows
    private void deleteTopic(String clusterName, String topicName) {
        try {
            topicApi().deleteTopic(clusterName, topicName).block();
        } catch (WebClientResponseException ignore) {
        }
    }

    @Step
    public ApiService deleteTopic(String topicName){
      deleteTopic(CLUSTER_NAME, topicName);
      return this;
    }

    @SneakyThrows
    private void createSchema(String clusterName, Schema schema) {
        NewSchemaSubject schemaSubject = new NewSchemaSubject();
        schemaSubject.setSubject(schema.getName());
        schemaSubject.setSchema(fileToString(schema.getValuePath()));
        schemaSubject.setSchemaType(schema.getType());
        try {
            schemaApi().createNewSchema(clusterName, schemaSubject).block();
        } catch (WebClientResponseException ex) {
            ex.printStackTrace();
        }
    }

    @Step
    public ApiService createSchema(Schema schema){
      createSchema(CLUSTER_NAME, schema);
      return this;
    }

    @SneakyThrows
    private void deleteSchema(String clusterName, String schemaName) {
        try {
            schemaApi().deleteSchema(clusterName, schemaName).block();
        } catch (WebClientResponseException ignore) {
        }
    }

    @Step
    public ApiService deleteSchema(String schemaName){
      deleteSchema(CLUSTER_NAME, schemaName);
      return this;
    }

    @SneakyThrows
    private void deleteConnector(String clusterName, String connectName, String connectorName) {
        try {
            connectorApi().deleteConnector(clusterName, connectName, connectorName).block();
        } catch (WebClientResponseException ignore) {
        }
    }

    @Step
    public ApiService deleteConnector(String connectName, String connectorName){
      deleteConnector(CLUSTER_NAME, connectName, connectorName);
      return this;
    }

    @SneakyThrows
    private void createConnector(String clusterName, String connectName, Connector connector) {
        NewConnector connectorProperties = new NewConnector();
        connectorProperties.setName(connector.getName());
        Map<String, Object> configMap = new ObjectMapper().readValue(connector.getConfig(), HashMap.class);
        connectorProperties.setConfig(configMap);
        try {
            connectorApi().deleteConnector(clusterName, connectName, connector.getName()).block();
        } catch (WebClientResponseException ignored) {
        }
        connectorApi().createConnector(clusterName, connectName, connectorProperties).block();
    }

    @Step
    public ApiService createConnector(String connectName, Connector connector){
      createConnector(CLUSTER_NAME, connectName, connector);
      return this;
    }

    @Step
    public String getFirstConnectName(String clusterName) {
        return connectorApi().getConnects(clusterName).blockFirst().getName();
    }

    @SneakyThrows
    private void sendMessage(String clusterName, Topic topic) {
      CreateTopicMessage createMessage = new CreateTopicMessage();
      createMessage.setPartition(0);
      createMessage.setKeySerde("String");
      createMessage.setValueSerde("String");
      createMessage.setKey(topic.getMessageKey());
      createMessage.setContent(topic.getMessageContent());
      try {
        messageApi().sendTopicMessages(clusterName, topic.getName(), createMessage).block();
      } catch (WebClientResponseException ex) {
        ex.getRawStatusCode();
      }
    }

    @Step
    public ApiService sendMessage(Topic topic) {
      sendMessage(CLUSTER_NAME, topic);
      return this;
    }

    @Step
    public ApiService createStream(Stream stream) {
      KsqlCommandV2Response pipeIdStream = ksqlApi().executeKsql(
          CLUSTER_NAME, new KsqlCommandV2()
              .ksql(String.format("CREATE STREAM %s (profileId VARCHAR, latitude DOUBLE, longitude DOUBLE) ",
                  stream.getName())
                  + String.format("WITH (kafka_topic='%s', value_format='json', partitions=1);",
                  stream.getTopicName())))
          .block();
      assert pipeIdStream != null;
      List<KsqlResponse> responseListStream =
          ksqlApi().openKsqlResponsePipe(CLUSTER_NAME, pipeIdStream.getPipeId()).collectList().block();
      assert Objects.requireNonNull(responseListStream).size() != 0;
      return this;
    }

    @Step
    public ApiService createTables(Table firstTable, Table secondTable) {
      KsqlCommandV2Response pipeIdTable1 = ksqlApi().executeKsql(
          CLUSTER_NAME, new KsqlCommandV2().ksql(
              String.format("CREATE TABLE %s AS ", firstTable.getName())
                  + "  SELECT profileId, "
                  + "         LATEST_BY_OFFSET(latitude) AS la, "
                  + "         LATEST_BY_OFFSET(longitude) AS lo "
                  + String.format("  FROM %s ", firstTable.getStreamName())
                  + "  GROUP BY profileId "
                  + "  EMIT CHANGES;"))
          .block();
      assert pipeIdTable1 != null;
      List<KsqlResponse> responseListTable =
          ksqlApi().openKsqlResponsePipe(CLUSTER_NAME, pipeIdTable1.getPipeId()).collectList().block();
      assert Objects.requireNonNull(responseListTable).size() != 0;
      KsqlCommandV2Response pipeIdTable2 = ksqlApi().executeKsql(
          CLUSTER_NAME,
          new KsqlCommandV2().ksql(String.format("CREATE TABLE %s AS ", secondTable.getName())
              + "  SELECT ROUND(GEO_DISTANCE(la, lo, 37.4133, -122.1162), -1) AS distanceInMiles, "
              + "         COLLECT_LIST(profileId) AS riders, "
              + "         COUNT(*) AS count "
              + String.format("  FROM %s ", firstTable.getName())
              + "  GROUP BY ROUND(GEO_DISTANCE(la, lo, 37.4133, -122.1162), -1);"))
          .block();
      assert pipeIdTable2 != null;
      List<KsqlResponse> responseListTable2 =
          ksqlApi().openKsqlResponsePipe(CLUSTER_NAME, pipeIdTable2.getPipeId()).collectList().block();
      assert Objects.requireNonNull(responseListTable2).size() != 0;
      return this;
    }

    @Step
    public ApiService insertInto(Stream stream) {
      String streamName = stream.getName();
      KsqlCommandV2Response pipeIdInsert = ksqlApi().executeKsql(CLUSTER_NAME, new KsqlCommandV2()
              .ksql(
                  "INSERT INTO " + streamName + " (profileId, latitude, longitude) VALUES ('c2309eec', 37.7877, -122.4205);"
                      + "INSERT INTO " + streamName +
                      " (profileId, latitude, longitude) VALUES ('18f4ea86', 37.3903, -122.0643); "
                      + "INSERT INTO " + streamName +
                      " (profileId, latitude, longitude) VALUES ('4ab5cbad', 37.3952, -122.0813); "
                      + "INSERT INTO " + streamName +
                      " (profileId, latitude, longitude) VALUES ('8b6eae59', 37.3944, -122.0813); "
                      + "INSERT INTO " + streamName +
                      " (profileId, latitude, longitude) VALUES ('4a7c7b41', 37.4049, -122.0822); "
                      + "INSERT INTO " + streamName +
                      " (profileId, latitude, longitude) VALUES ('4ddad000', 37.7857, -122.4011);"))
          .block();
      assert pipeIdInsert != null;
      List<KsqlResponse> responseListInsert =
          ksqlApi().openKsqlResponsePipe(CLUSTER_NAME, pipeIdInsert.getPipeId()).collectList().block();
      assert Objects.requireNonNull(responseListInsert).size() != 0;
      return this;
    }
}
