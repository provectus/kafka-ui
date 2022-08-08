package com.provectus.kafka.ui.pages;

import com.provectus.kafka.ui.pages.connector.ConnectorsList;
import com.provectus.kafka.ui.pages.connector.ConnectorsView;
import com.provectus.kafka.ui.pages.schema.SchemaRegistryList;
import com.provectus.kafka.ui.pages.topic.TopicView;
import com.provectus.kafka.ui.pages.topic.TopicsList;

public class Pages {

    public static Pages INSTANCE = new Pages();

    public MainPage mainPage = new MainPage();
    public TopicsList topicsList = new TopicsList();
    public TopicView topicView = new TopicView();
    public ProduceMessagePage produceMessagePage = new ProduceMessagePage();
    public ConnectorsList connectorsList = new ConnectorsList();
    public ConnectorsView connectorsView = new ConnectorsView();
    public SchemaRegistryList schemaRegistry = new SchemaRegistryList();

    public MainPage open() {
        return openMainPage();
    }

    public MainPage openMainPage() {
        return mainPage.goTo();
    }

    public TopicsList openTopicsList(String clusterName) {
        return topicsList.goTo(clusterName);
    }

    public TopicView openTopicView(String clusterName, String topicName) {
        return topicView.goTo(clusterName, topicName);
    }

    public ConnectorsList openConnectorsList(String clusterName) {
        return connectorsList.goTo(clusterName);
    }

    public ConnectorsView openConnectorsView(String clusterName, String connectorName) {
        return connectorsView.goTo(clusterName, connectorName);
    }

}
