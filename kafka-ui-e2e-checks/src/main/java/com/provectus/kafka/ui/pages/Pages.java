package com.provectus.kafka.ui.pages;

import com.provectus.kafka.ui.pages.connector.ConnectorsList;
import com.provectus.kafka.ui.pages.connector.ConnectorsView;
import com.provectus.kafka.ui.pages.schema.SchemaRegistryList;
import com.provectus.kafka.ui.pages.topic.ProduceMessagePanel;
import com.provectus.kafka.ui.pages.topic.TopicView;
import com.provectus.kafka.ui.pages.topic.TopicsList;
import io.qameta.allure.Step;

public class Pages {

    public static Pages INSTANCE = new Pages();

    public MainPage mainPage = new MainPage();
    public TopicsList topicsList = new TopicsList();
    public TopicView topicView = new TopicView();
    public ProduceMessagePanel produceMessagePanel = new ProduceMessagePanel();
    public ConnectorsList connectorsList = new ConnectorsList();
    public ConnectorsView connectorsView = new ConnectorsView();
    public SchemaRegistryList schemaRegistry = new SchemaRegistryList();

    @Step
    public MainPage open() {
        return openMainPage();
    }

    @Step
    public MainPage openMainPage() {
        return mainPage.goTo();
    }

    @Step
    public TopicsList openTopicsList(String clusterName) {
        return topicsList.goTo(clusterName);
    }

    @Step
    public TopicView openTopicView(String clusterName, String topicName) {
        return topicView.goTo(clusterName, topicName);
    }

    @Step
    public ConnectorsList openConnectorsList(String clusterName) {
        return connectorsList.goTo(clusterName);
    }

    @Step
    public ConnectorsView openConnectorsView(String clusterName, String connectorName) {
        return connectorsView.goTo(clusterName, connectorName);
    }

}
