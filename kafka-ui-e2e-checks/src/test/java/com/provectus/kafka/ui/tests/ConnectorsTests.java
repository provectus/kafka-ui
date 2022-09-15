package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.helpers.ApiHelper;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.models.Connector;
import com.provectus.kafka.ui.models.Topic;
import com.provectus.kafka.ui.utils.qaseIO.Status;
import com.provectus.kafka.ui.utils.qaseIO.annotation.AutomationStatus;
import com.provectus.kafka.ui.utils.qaseIO.annotation.Suite;
import io.qase.api.annotation.CaseId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static com.provectus.kafka.ui.extensions.FileUtils.getResourceAsString;

public class ConnectorsTests extends BaseTest {

    private static final long SUITE_ID = 10;
    private static final String SUITE_TITLE = "Kafka Connect";
    private static final String CONNECT_NAME = "first";
    private static final List <Topic> topicNames = new ArrayList<>();
    private static final List <Connector> connectorList = new ArrayList<>();
    private static final Topic topicForCreateConnector = new Topic().setName("topic_for_connector").setMessage(getResourceAsString("message_content_create_topic.json"));
    private static final Topic topicForDeleteConnector = new Topic().setName("topic_for_delete_connector").setMessage(getResourceAsString("message_content_create_topic.json"));
    private static final Topic topicForUpdateConnector = new Topic().setName("topic_for_update_connector").setMessage(getResourceAsString("message_content_create_topic.json"));
    private static final Connector connectorForDelete = new Connector().setName("sink_postgres_activities_e2e_checks_for_delete").setConfig(getResourceAsString("delete_connector_config.json"));
    private static final Connector connectorForUpdate = new Connector().setName("sink_postgres_activities_e2e_checks_for_update").setConfig(getResourceAsString("config_for_create_connector_via_api.json"));

    @BeforeAll
    public static void beforeAll() {
        ApiHelper apiHelper = Helpers.INSTANCE.apiHelper;

        topicNames.addAll(List.of(topicForCreateConnector,topicForDeleteConnector,topicForUpdateConnector));

        topicNames.forEach(topic -> { apiHelper.createTopic(CLUSTER_NAME, topic.getName());
                apiHelper.sendMessage(CLUSTER_NAME,topic.getName(), topic.getMessage()," ");});

        connectorList.addAll(List.of(connectorForDelete,connectorForUpdate));

        connectorList.forEach(connector -> apiHelper.createConnector(CLUSTER_NAME,CONNECT_NAME,connector.getName(),connector.getConfig()));
    }

    @DisplayName("should create a connector")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(42)
    @Test
    public void createConnector() {
        Connector connectorForCreate = new Connector().setName("sink_postgres_activities_e2e_checks").setConfig(getResourceAsString("config_for_create_connector.json"));
        pages.openConnectorsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .clickCreateConnectorButton()
                .waitUntilScreenReady()
                .setConnectorConfig(connectorForCreate.getName(), connectorForCreate.getConfig());
        pages.openConnectorsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .connectorIsVisibleInList(connectorForCreate.getName(), topicForCreateConnector.getName());
        connectorList.add(connectorForCreate);
    }

    @DisplayName("should update a connector")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(196)
    @Test
    public void updateConnector() {
        pages.openConnectorsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openConnector(connectorForUpdate.getName());
        pages.connectorsView.connectorIsVisibleOnOverview();
        pages.connectorsView.openEditConfig()
                .updConnectorConfig(connectorForUpdate.getConfig());
        pages.openConnectorsList(CLUSTER_NAME)
                .connectorIsVisibleInList(connectorForUpdate.getName(), topicForUpdateConnector.getName());
    }

    @DisplayName("should delete connector")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(195)
    @Test
    public void deleteConnector() {
        pages.openConnectorsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openConnector(connectorForDelete.getName());
        pages.connectorsView.clickDeleteButton();
        pages.openConnectorsList(CLUSTER_NAME)
                .isNotVisible(connectorForDelete.getName());
    }

    @AfterAll
    public static void afterAll() {
        ApiHelper apiHelper = Helpers.INSTANCE.apiHelper;
        connectorList.forEach(connector-> apiHelper.deleteConnector(CLUSTER_NAME,CONNECT_NAME,connector.getName()));
        topicNames.forEach(topic -> apiHelper.deleteTopic(CLUSTER_NAME,topic.getName()));
    }
}
