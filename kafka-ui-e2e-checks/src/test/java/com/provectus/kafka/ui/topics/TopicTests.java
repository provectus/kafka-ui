package com.provectus.kafka.ui.topics;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.pages.MainPage;
import lombok.SneakyThrows;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class TopicTests extends BaseTest {


    public static final String NEW_TOPIC = "new-topic";
    public static final String TOPIC_FOR_UPDATE = "topic-for-update";
    public static final String SECOND_LOCAL = "secondLocal";

    @AfterEach
    @SneakyThrows
    void afterEach() {
    }

    @SneakyThrows
    @DisplayName("should create a topic")
    @Test
    void createTopic(){
        try {
            helpers.apiHelper.createTopic("secondLocal", "new-topic");
            pages.open()
                    .shouldBeOnPage()
                    .goToSideMenu("secondLocal", MainPage.SideMenuOptions.TOPICS)
                    .shouldBeTopic(NEW_TOPIC);
        } finally {
            helpers.apiHelper.deleteTopic("secondLocal","new-topic");
        }
    }

    @SneakyThrows
    @DisplayName("should update a topic")
    @Test
    void updateTopic(){
        try {
            helpers.apiHelper.createTopic(SECOND_LOCAL, TOPIC_FOR_UPDATE);
            pages.openTopicPage()
                    .shouldBeOnPage()
                    .openTopic(TOPIC_FOR_UPDATE)
                    .openEditSettings();
        } finally {
            helpers.apiHelper.deleteTopic(SECOND_LOCAL,TOPIC_FOR_UPDATE);
        }
    }

}
