package com.provectus.kafka.ui.topics;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.pages.MainPage;
import com.provectus.kafka.ui.steps.kafka.KafkaSteps;
import com.provectus.kafka.ui.helpers.ApiHelper;
import lombok.SneakyThrows;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class TopicTests extends BaseTest {


    public static final String NEW_TOPIC = "new-topic";

    @AfterEach
    @SneakyThrows
        void  afterEach(){
            helpers.apiHelper.deleteTopic("secondLocal","new-topic");
    }

    @SneakyThrows
    @DisplayName("should create a topic")
    @Test
    void createTopic(){
        helpers.apiHelper.createTopic("secondLocal","new-topic");
        pages.open()
                .mainPage.shouldBeOnPage()
        .goToSideMenu(KafkaSteps.Cluster.SECOND_LOCAL.getName(), MainPage.SideMenuOptions.TOPICS)
        .shouldBeTopic(NEW_TOPIC);
    }
}
