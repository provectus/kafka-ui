package com.provectus.kafka.ui.topics;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.pages.MainPage;
import com.provectus.kafka.ui.pages.TopicViewPage;
import lombok.SneakyThrows;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;


public class TopicTests extends BaseTest {

    public static final String UPDATE_TOPIC = "update-topic";
    public static final String NEW_TOPIC = "new-topic";
    public static final String SECOND_LOCAL = "secondLocal";
    public static final String COMPACT_POLICY_VALUE = "compact";
    public static final String UPDATED_TIME_TO_RETAIN_VALUE = "604800001";
    public static final String UPDATED_MAX_SIZE_ON_DISK = "20 GB";
    public static final String UPDATED_MAX_MESSAGE_BYTES = "1000020";

    @BeforeAll
    @SneakyThrows
    public static void beforeAll() {
        Helpers.INSTANCE.apiHelper.createTopic(SECOND_LOCAL, UPDATE_TOPIC);
    }

    @AfterAll
    @SneakyThrows
    public static void afterAll() {
        Helpers.INSTANCE.apiHelper.deleteTopic(SECOND_LOCAL, UPDATE_TOPIC);
    }

    @SneakyThrows
    @DisplayName("should create a topic")
    @Test
    void createTopic() {
        try {
            helpers.apiHelper.createTopic(SECOND_LOCAL, NEW_TOPIC);
            pages.open()
                    .shouldBeOnPage()
                    .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.TOPICS)
                    .shouldBeTopic(NEW_TOPIC);
        } finally {
            helpers.apiHelper.deleteTopic(SECOND_LOCAL, NEW_TOPIC);
        }
    }

    @SneakyThrows
    @DisplayName("should update a topic")
    @Test
    void updateTopic(){
        final String path = "ui/clusters/" + SECOND_LOCAL + "/topics/" + UPDATE_TOPIC;

        pages.openTopicsListPage()
                .shouldBeOnPage()
                .openTopic(UPDATE_TOPIC);
        pages.openTopicViewPage(path)
                .openEditSettings()
                .changeCleanupPolicy(COMPACT_POLICY_VALUE)
                .changeTimeToRetainValue(UPDATED_TIME_TO_RETAIN_VALUE)
                .changeMaxSizeOnDisk(UPDATED_MAX_SIZE_ON_DISK)
                .changeMaxMessageBytes(UPDATED_MAX_MESSAGE_BYTES)
                .submitSettingChanges();
        pages.reloadPage();
        TopicViewPage topicViewPage = pages.openTopicViewPage(path)
                .openEditSettings();

        Assertions.assertEquals(COMPACT_POLICY_VALUE, topicViewPage.cleanupPolicy.getSelectedValue());
        Assertions.assertEquals(UPDATED_TIME_TO_RETAIN_VALUE,topicViewPage.timeToRetain.getValue());
        Assertions.assertEquals(UPDATED_MAX_SIZE_ON_DISK,topicViewPage.maxSizeOnDisk.getSelectedText());
        Assertions.assertEquals(UPDATED_MAX_MESSAGE_BYTES,topicViewPage.maxMessageBytes.getValue());
    }

}
