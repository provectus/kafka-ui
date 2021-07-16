package com.provectus.kafka.ui.topics;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.pages.MainPage;
import lombok.SneakyThrows;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class TopicTests extends BaseTest {

    public static final String NEW_TOPIC = "new-topic";
    public static final String SECOND_LOCAL = "secondLocal";

    @BeforeEach
    @SneakyThrows
    void beforeEach() {
        helpers.apiHelper.createTopic(SECOND_LOCAL, NEW_TOPIC);
    }

    @AfterEach
    @SneakyThrows
    void afterEach() {
        helpers.apiHelper.deleteTopic(SECOND_LOCAL, NEW_TOPIC);
    }

    @SneakyThrows
    @DisplayName("should create a topic")
    @Test
    void createTopic(){
        pages.open()
                .shouldBeOnPage()
                .goToSideMenu("secondLocal", MainPage.SideMenuOptions.TOPICS)
                .shouldBeTopic(NEW_TOPIC);
    }

    @SneakyThrows
    @DisplayName("should update a topic")
    @Test
    void updateTopic(){
        pages.openTopicPage()
                .shouldBeOnPage()
                .openTopic(NEW_TOPIC)
                .openEditSettings();
    }

}
