package com.provectus.kafka.ui.topics;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.pages.MainPage;
import lombok.SneakyThrows;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class TopicTests extends BaseTest {


    public static final String NEW_TOPIC = "new-topic";

    @AfterEach
    @SneakyThrows
    void  afterEach(){
        steps.kafka.deleteTopic(NEW_TOPIC);
    }
    @SneakyThrows
    @DisplayName("should create a topic")
    @Test
    void shouldWhen(){
        steps.kafka.createTopic(NEW_TOPIC);
//        Thread.sleep(15000);
        pages.open()
                .mainPage.shouldBeOnPage()
        .goToSideMenu("secondLocal", MainPage.SideMenuOptions.TOPICS)
        .shouldBeTopic(NEW_TOPIC);
    }
}
