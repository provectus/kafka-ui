package com.provectus.kafka.ui.steps.kafka.connectorssteps;

import com.provectus.kafka.ui.extensions.FileUtils;
import com.provectus.kafka.ui.pages.Pages;
import com.provectus.kafka.ui.pages.connector.ConnectorsList;
import io.qase.api.annotation.Step;

import java.io.IOException;

import static com.provectus.kafka.ui.steps.kafka.connectorssteps.ConnectorConstance.LOCAL_CLUSTER;
import static com.provectus.kafka.ui.steps.kafka.connectorssteps.ConnectorConstance.SINK_CONNECTOR;

public class ConnectorsSteps extends Pages {
    public static final ConnectorsSteps INSTANCE = new ConnectorsSteps();

    private ConnectorsSteps() {}

    @Step("open connector page")
    public ConnectorsSteps openPage(String clusterName) {
        openConnectorsList(clusterName);
        return INSTANCE;
    }

    @Step("open connector with name {connectorName}")
    public ConnectorsSteps openConnector(String connectorName) {
        ConnectorsList.openConnector(connectorName);
        connectorsView.connectorIsVisibleOnOverview();
        return this;
    }

    @Step("should create a connector")
    public ConnectorsSteps createConnector() throws IOException, InterruptedException {
        ConnectorsList.clickCreateConnectorButton()
                .isOnConnectorCreatePage()
                .setConnectorConfig(
                        SINK_CONNECTOR,
                        FileUtils.getResourceAsString("config_for_create_connector.json"));
        return this;
    }

    @Step("connector should be visible in the list")
    public void isConnectorVisible(String connectorName, String connectorTopic) {
        openConnectorsList(LOCAL_CLUSTER);
        connectorsList.isOnPage()
                .connectorIsVisibleInList(connectorName, connectorTopic);
    }

    @Step("should update a connector")
    public ConnectorsSteps updateConnector() throws IOException {
        connectorsView.openEditConfig()
                .updConnectorConfig(FileUtils.getResourceAsString("config_for_update_connector.json"));
        return this;
    }

    @Step("connector should not be visible")
    public void connectorIsNotVisible(String connectorName) {
        openConnectorsList(LOCAL_CLUSTER)
                .isNotVisible(connectorName);
    }

    @Step("should delete connector")
    public ConnectorsSteps deleteConnector() {
        connectorsView.clickDeleteButton();
        return this;

    }
}
