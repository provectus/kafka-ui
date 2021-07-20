package com.provectus.kafka.ui.topics;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.pages.MainPage;
import lombok.SneakyThrows;
import org.junit.Assert;
import org.junit.jupiter.api.*;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;

public class TopicTests extends BaseTest {

    public static final String UPDATE_TOPIC = "update-topic";
    public static final String NEW_TOPIC = "new-topic";
    public static final String SECOND_LOCAL = "secondLocal";

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
                .changeCleanupPolicy("compact")
                .changeTimeToRetainValue("604800001")
                .changeMaxSizeOnDisk("20 GB")
                .changeMaxMessageBytes("1000020")
                .submitSettingChanges();
        pages.reloadPage();
        pages.openTopicViewPage(path)
                .openEditSettings();

        String cleanupPolicy =  $(By.name("cleanupPolicy")).getSelectedValue();
        Assert.assertEquals("compact", cleanupPolicy);
    }

}
