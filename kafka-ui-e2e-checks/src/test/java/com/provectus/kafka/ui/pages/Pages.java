package com.provectus.kafka.ui.pages;

public class Pages {

    public static Pages INSTANCE = new Pages();

    public MainPage mainPage = new MainPage();
    public TopicsList topicsList = new TopicsList();
    public TopicView topicView = new TopicView();
    public ConnectorsList connectorsList = new ConnectorsList();

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

}
