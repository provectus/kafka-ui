package com.provectus.kafka.ui.topics;

import com.codeborne.selenide.Selenide;
import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.extensions.FileProcessor;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.pages.MainPage;
import com.provectus.kafka.ui.pages.ProduceMessagePage;
import com.provectus.kafka.ui.pages.TopicView;
import lombok.SneakyThrows;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static com.provectus.kafka.ui.extensions.FileProcessor.readFileAsString;


public class TopicTests extends BaseTest {

    public static final String NEW_TOPIC = "new-topic";
    public static final String TOPIC_TO_UPDATE = "topic-to-update";
    public static final String TOPIC_TO_DELETE = "topic-to-delete";
    public static final String SECOND_LOCAL = "secondLocal";
    public static final String COMPACT_POLICY_VALUE = "compact";
    public static final String UPDATED_TIME_TO_RETAIN_VALUE = "604800001";
    public static final String UPDATED_MAX_SIZE_ON_DISK = "20 GB";
    public static final String UPDATED_MAX_MESSAGE_BYTES = "1000020";
    private static final String PATH_TO_AVRO = System.getProperty("user.dir") + "/src/test/resources/avro_msg_value.json";
    private static final String PATH_UNKNOWN_VALUE = System.getProperty("user.dir") + "/src/test/resources/unknown_value.json";
    private static final String PATH_TO_SCHEMA = System.getProperty("user.dir") + "/src/test/resources/schemaValue.json";

    @BeforeAll
    @SneakyThrows
    public static void beforeAll() {
        Helpers.INSTANCE.apiHelper.createTopic(SECOND_LOCAL, TOPIC_TO_UPDATE);
        Helpers.INSTANCE.apiHelper.createTopic(SECOND_LOCAL, TOPIC_TO_DELETE);
    }

    @AfterAll
    @SneakyThrows
    public static void afterAll() {
        Helpers.INSTANCE.apiHelper.deleteTopic(SECOND_LOCAL, TOPIC_TO_UPDATE);
        Helpers.INSTANCE.apiHelper.deleteTopic(SECOND_LOCAL, TOPIC_TO_DELETE);
    }

    @SneakyThrows
    @DisplayName("should create a topic")
    @Test
    void createTopic() {
        try {
            helpers.apiHelper.createTopic(SECOND_LOCAL, NEW_TOPIC);
            pages.open()
                    .isOnPage()
                    .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.TOPICS)
                    .topicIsVisible(NEW_TOPIC);
        } finally {
            helpers.apiHelper.deleteTopic(SECOND_LOCAL, NEW_TOPIC);
        }
    }

    @SneakyThrows
    @DisplayName("should update a topic")
    @Test
    void updateTopic() {
        pages.openTopicsList(SECOND_LOCAL)
                .isOnPage()
                .openTopic(TOPIC_TO_UPDATE);
        Selenide.refresh();
        pages.openTopicView(SECOND_LOCAL, TOPIC_TO_UPDATE)
                .openEditSettings()
                .changeCleanupPolicy(COMPACT_POLICY_VALUE)
                .changeTimeToRetainValue(UPDATED_TIME_TO_RETAIN_VALUE)
                .changeMaxSizeOnDisk(UPDATED_MAX_SIZE_ON_DISK)
                .changeMaxMessageBytes(UPDATED_MAX_MESSAGE_BYTES)
                .submitSettingChanges();
        Selenide.refresh();
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
    @Disabled
    void deleteTopic() {

        pages.openTopicsList(SECOND_LOCAL)
                .isOnPage()
                .openTopic(TOPIC_TO_DELETE);
        pages.openTopicView(SECOND_LOCAL, TOPIC_TO_DELETE).clickDeleteTopicButton();
        pages.openTopicsList(SECOND_LOCAL).isNotVisible(TOPIC_TO_DELETE);
        
    }

    @SneakyThrows
    @DisplayName("should update a topic with Produce Message")
    @Test
    void updateTopicWithProduceMessage() {
        String baseUrl = "http://localhost:8080/ui/clusters/secondLocal/topics/";
        pages.openMainPage()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateschema()
                .setSubjectname("avro_msg_value").setSchemafield(readFileAsString(PATH_TO_AVRO))
                .selectFromDropdown(MainPage.SchemaType.AVRO)
                .clickSubmit()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateschema()
                .setSubjectname("unknown_value").setSchemafield(readFileAsString(PATH_UNKNOWN_VALUE))
                .selectFromDropdown(MainPage.SchemaType.AVRO)
                .clickSubmit()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
        pages.schemaRegistry.clickCreateschema()
                .setSubjectname("schemaValue").setSchemafield(readFileAsString(PATH_TO_SCHEMA))
                .selectFromDropdown(MainPage.SchemaType.AVRO)
                .clickSubmit();

        pages.openTopicsList(SECOND_LOCAL)
                .isOnPage()
                .openTopic(TOPIC_TO_UPDATE);
        Selenide.refresh();
        pages.openTopicView(SECOND_LOCAL, TOPIC_TO_UPDATE)
                .clickOnButton("Produce message")
                .typeIntoContentFiled(readFileAsString(System.getProperty("user.dir") + "/src/test/resources/testData.txt"))
                .typeIntoKeyFiled(readFileAsString(System.getProperty("user.dir") + "/src/test/resources/producedkey.txt"))
                .submitProduceMessage(baseUrl + "topic-to-update/messages");
                pages.openMainPage()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
                pages.schemaRegistry.openSchema("unknown_value").removeSchema();
                pages.schemaRegistry.isNotVisible("unknown_value");
                pages.openMainPage()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
                pages.schemaRegistry.openSchema("schemaValue").removeSchema();
                pages.schemaRegistry.isNotVisible("schemaValue");
                pages.openMainPage()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.SCHEMA_REGISTRY);
                pages.schemaRegistry.openSchema("avro_msg_value").removeSchema();
                pages.schemaRegistry.isNotVisible("avro_msg_value");







    }

}
