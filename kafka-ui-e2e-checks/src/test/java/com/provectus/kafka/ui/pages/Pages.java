package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Selenide;
import com.provectus.kafka.ui.base.TestConfiguration;

public class Pages {

    public static Pages INSTANCE = new Pages();

    public MainPage mainPage = new MainPage();
    public TopicsList topicsList = new TopicsList();
    public TopicView topicView = new TopicView();

    private Pages goTo(String path) {
        Selenide.open(TestConfiguration.BASE_URL+path);
        return this;
    }

    public MainPage open() {
       return openMainPage();
    }

    public MainPage openMainPage() {
        return goTo(MainPage.path).mainPage;
    }

    public TopicsList openTopicsList(String clusterName) {
        return goTo(TopicsList.path.formatted(clusterName)).topicsList;
    }

    public TopicView openTopicView(String clusterName, String topicName) {
        return goTo(TopicView.path.formatted(clusterName, topicName)).topicView;
    }

}
