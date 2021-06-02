package com.provectus.kafka.ui.topics;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.pages.MainPage;
import com.provectus.kafka.ui.steps.kafka.KafkaSteps;
import lombok.SneakyThrows;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class TopicTests extends BaseTest {


    public static final String NEW_TOPIC = "new-topic";

    @AfterEach
    @SneakyThrows
    void  afterEach(){
        steps.kafka.deleteTopic(KafkaSteps.Cluster.SECOND_LOCAL,NEW_TOPIC);
    }

    @SneakyThrows
    @DisplayName("should create a topic")
    @Test
    void createTopic(){
        steps.kafka.createTopic(KafkaSteps.Cluster.SECOND_LOCAL,NEW_TOPIC);
        pages.open()
                .mainPage.shouldBeOnPage()
        .goToSideMenu(KafkaSteps.Cluster.SECOND_LOCAL.getName(), MainPage.SideMenuOptions.TOPICS)
        .shouldBeTopic(NEW_TOPIC);
    }
}
