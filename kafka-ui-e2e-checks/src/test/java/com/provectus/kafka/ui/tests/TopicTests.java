package com.provectus.kafka.ui.tests;

import com.codeborne.selenide.Selenide;
import com.provectus.kafka.ui.api.model.SchemaType;
import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.pages.MainPage;
import io.qameta.allure.Issue;
import lombok.SneakyThrows;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.apache.kafka.common.utils.Utils.readFileAsString;


public class TopicTests extends BaseTest {

    public static final String NEW_TOPIC = "new-topic";
    public static final String TOPIC_TO_UPDATE = "topic-to-update";
    public static final String TOPIC_TO_DELETE = "topic-to-delete";
    public static final String SECOND_LOCAL = "secondLocal";
    public static final String COMPACT_POLICY_VALUE = "Compact";
    public static final String UPDATED_TIME_TO_RETAIN_VALUE = "604800001";
    public static final String UPDATED_MAX_SIZE_ON_DISK = "20 GB";
    public static final String UPDATED_MAX_MESSAGE_BYTES = "1000020";
    private static final String PATH_TO_AVRO = System.getProperty("user.dir") + "/src/test/resources/avro_msg_value.json";
    private static final String PATH_UNKNOWN_VALUE = System.getProperty("user.dir") + "/src/test/resources/unknown_value.json";
    private static final String PATH_TO_SCHEMA = System.getProperty("user.dir") + "/src/test/resources/schemaValue.json";
    private static final String KEY_TO_PRODUCE_MESSAGE = System.getProperty("user.dir") + "/src/test/resources/producedkey.txt";
    private static final String CONTENT_TO_PRODUCE_MESSAGE = System.getProperty("user.dir") + "/src/test/resources/testData.txt";
    public static final String AVRO_MSG = "avro_msg_value";
    public static final String UNKNOWN = "unknown_value";
    public static final String VALUE = "schemaValue";



    @BeforeAll
    @SneakyThrows
    public static void beforeAll() {
        Helpers.INSTANCE.apiHelper.createTopic(SECOND_LOCAL, TOPIC_TO_UPDATE);
        Helpers.INSTANCE.apiHelper.createTopic(SECOND_LOCAL, TOPIC_TO_DELETE);
        Helpers.INSTANCE.apiHelper.createSchema(SECOND_LOCAL, AVRO_MSG, SchemaType.AVRO, readFileAsString(PATH_TO_AVRO));
        Helpers.INSTANCE.apiHelper.createSchema(SECOND_LOCAL, UNKNOWN, SchemaType.AVRO, readFileAsString(PATH_UNKNOWN_VALUE));
        Helpers.INSTANCE.apiHelper.createSchema(SECOND_LOCAL, VALUE, SchemaType.AVRO, readFileAsString(PATH_TO_SCHEMA));
    }

    @AfterAll
    @SneakyThrows
    public static void afterAll() {
        Helpers.INSTANCE.apiHelper.deleteTopic(SECOND_LOCAL, TOPIC_TO_UPDATE);
        Helpers.INSTANCE.apiHelper.deleteTopic(SECOND_LOCAL, TOPIC_TO_DELETE);
        Helpers.INSTANCE.apiHelper.deleteTopic(SECOND_LOCAL, NEW_TOPIC);
        Helpers.INSTANCE.apiHelper.deleteSchema(SECOND_LOCAL, AVRO_MSG);
        Helpers.INSTANCE.apiHelper.deleteSchema(SECOND_LOCAL, UNKNOWN);
        Helpers.INSTANCE.apiHelper.deleteSchema(SECOND_LOCAL, VALUE);
    }

    @SneakyThrows
    @DisplayName("should create a topic")
    @Test
    public void createTopic() {
        pages.open()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.TOPICS);
        pages.topicsList.pressCreateNewTopic()
                .setTopicName(NEW_TOPIC)
                .sendData()
                .isOnTopicViewPage();
        pages.open()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.TOPICS)
                .topicIsVisible(NEW_TOPIC);
        helpers.apiHelper.deleteTopic(SECOND_LOCAL, NEW_TOPIC);
        pages.open()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.TOPICS)
                .topicIsNotVisible(NEW_TOPIC);
    }

    @Disabled("Due to issue https://github.com/provectus/kafka-ui/issues/1500 ignore this test")
    @SneakyThrows
    @DisplayName("should update a topic")
    @Issue("1500")
    @Test
    public void updateTopic() {
        pages.openTopicsList(SECOND_LOCAL)
                .isOnPage();
        pages.openTopicView(SECOND_LOCAL, TOPIC_TO_UPDATE)
                .openEditSettings()
                .selectCleanupPolicy(COMPACT_POLICY_VALUE)
                .setMinInsyncReplicas(10)
                .setTimeToRetainDataInMs(UPDATED_TIME_TO_RETAIN_VALUE)
                .setMaxSizeOnDiskInGB(UPDATED_MAX_SIZE_ON_DISK)
                .setMaxMessageBytes(UPDATED_MAX_MESSAGE_BYTES)
                .sendData()
                .isOnTopicViewPage();

        pages.openTopicsList(SECOND_LOCAL)
                .isOnPage();
        pages.openTopicView(SECOND_LOCAL, TOPIC_TO_UPDATE)
                .openEditSettings()
                // Assertions
                .cleanupPolicyIs(COMPACT_POLICY_VALUE)
                .timeToRetainIs(UPDATED_TIME_TO_RETAIN_VALUE)
                .maxSizeOnDiskIs(UPDATED_MAX_SIZE_ON_DISK)
                .maxMessageBytesIs(UPDATED_MAX_MESSAGE_BYTES);
    }

    @SneakyThrows
    @DisplayName("should delete topic")
    @Test
    public void deleteTopic() {
        pages.openTopicsList(SECOND_LOCAL)
                .isOnPage()
                .openTopic(TOPIC_TO_DELETE)
                .isOnTopicViewPage()
                .deleteTopic()
                .isOnPage()
                .isTopicNotVisible(TOPIC_TO_DELETE);
    }

    @SneakyThrows
    @DisplayName("produce message")
    @Test
    void produceMessage(){
        pages.openTopicsList(SECOND_LOCAL)
                .isOnPage()
                .openTopic(TOPIC_TO_UPDATE);
        Selenide.refresh();
        pages.openTopicView(SECOND_LOCAL, TOPIC_TO_UPDATE)
                .clickOnButton("Produce message")
                .setContentFiled(readFileAsString(CONTENT_TO_PRODUCE_MESSAGE))
                .setKeyField(readFileAsString(KEY_TO_PRODUCE_MESSAGE))
                .submitProduceMessage()
                .isMessageOnPage(readFileAsString(KEY_TO_PRODUCE_MESSAGE));
    }
}
