package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.helpers.ApiHelper;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.models.Topic;
import com.provectus.kafka.ui.pages.MainPage;
import com.provectus.kafka.ui.pages.topic.TopicView;
import com.provectus.kafka.ui.utils.qaseIO.Status;
import com.provectus.kafka.ui.utils.qaseIO.annotation.AutomationStatus;
import com.provectus.kafka.ui.utils.qaseIO.annotation.Suite;
import io.qameta.allure.Issue;
import io.qase.api.annotation.CaseId;
import org.junit.jupiter.api.*;

import java.util.ArrayList;
import java.util.List;

import static com.provectus.kafka.ui.extensions.FileUtils.fileToString;

public class TopicTests extends BaseTest {

//    public static final String NEW_TOPIC = "new-topic";
    private static final Topic topicToUpdate = new Topic().setName("topic-to-update");
    private static final Topic topicToDelete = new Topic().setName("topic-to-delete");
    private static final List<Topic> topicList = new ArrayList<>();
//    public static final String TOPIC_TO_UPDATE = "topic-to-update";
//    public static final String TOPIC_TO_DELETE = "topic-to-delete";
    public static final String COMPACT_POLICY_VALUE = "Compact";
    public static final String UPDATED_TIME_TO_RETAIN_VALUE = "604800001";
    public static final String UPDATED_MAX_SIZE_ON_DISK = "20 GB";
    public static final String UPDATED_MAX_MESSAGE_BYTES = "1000020";
    private static final String KEY_TO_PRODUCE_MESSAGE = System.getProperty("user.dir") + "/src/test/resources/producedkey.txt";
    private static final String CONTENT_TO_PRODUCE_MESSAGE = System.getProperty("user.dir") + "/src/test/resources/testData.txt";


    @BeforeAll
    public static void beforeAll() {
        ApiHelper apiHelper = Helpers.INSTANCE.apiHelper;
        topicList.addAll(List.of(topicToUpdate,topicToDelete));
        topicList.forEach(topic -> apiHelper.createTopic(CLUSTER_NAME,topic.getName()));
//        Helpers.INSTANCE.apiHelper.createTopic(CLUSTER_NAME, TOPIC_TO_UPDATE);
//        Helpers.INSTANCE.apiHelper.createTopic(CLUSTER_NAME, TOPIC_TO_DELETE);
    }

    @DisplayName("should create a topic")
    @Suite(suiteId = 4, title = "Create new Topic")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(199)
    @Test
    public void createTopic() {
        Topic topicForCreate = new Topic().setName("new-topic");
        pages.open()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.TOPICS);
        pages.topicsList.pressCreateNewTopic()
                .setTopicName(topicForCreate.getName())
                .sendData()
                .waitUntilScreenReady();
        pages.open()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.TOPICS)
                .topicIsVisible(topicForCreate.getName());
        helpers.apiHelper.deleteTopic(CLUSTER_NAME, topicForCreate.getName());
        pages.open()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.TOPICS)
                .topicIsNotVisible(topicForCreate.getName());
        topicList.add(topicForCreate);
    }
    @Disabled("Due to issue https://github.com/provectus/kafka-ui/issues/1500 ignore this test")
    @DisplayName("should update a topic")
    @Issue("1500")
    @Suite(suiteId = 2, title = "Topics")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(197)
    @Test
    public void updateTopic() {
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady();
        pages.openTopicView(CLUSTER_NAME, topicToUpdate.getName())
                .waitUntilScreenReady()
                .openEditSettings()
                .selectCleanupPolicy(COMPACT_POLICY_VALUE)
                .setMinInsyncReplicas(10)
                .setTimeToRetainDataInMs(UPDATED_TIME_TO_RETAIN_VALUE)
                .setMaxSizeOnDiskInGB(UPDATED_MAX_SIZE_ON_DISK)
                .setMaxMessageBytes(UPDATED_MAX_MESSAGE_BYTES)
                .sendData()
                .waitUntilScreenReady();

        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady();
        pages.openTopicView(CLUSTER_NAME, topicToUpdate.getName())
                .openEditSettings()
                // Assertions
                .cleanupPolicyIs(COMPACT_POLICY_VALUE)
                .timeToRetainIs(UPDATED_TIME_TO_RETAIN_VALUE)
                .maxSizeOnDiskIs(UPDATED_MAX_SIZE_ON_DISK)
                .maxMessageBytesIs(UPDATED_MAX_MESSAGE_BYTES);
    }

    @DisplayName("should delete topic")
    @Suite(suiteId = 2, title = "Topics")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(207)
    @Test
    public void deleteTopic() {
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openTopic(topicToDelete.getName())
                .waitUntilScreenReady()
                .deleteTopic();
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .isTopicNotVisible(topicToDelete.getName());
    }

    @DisplayName("produce message")
    @Suite(suiteId = 2, title = "Topics")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(222)
    @Test
    void produceMessage() {
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openTopic(topicToUpdate.getName())
                .waitUntilScreenReady()
                .openTopicMenu(TopicView.TopicMenu.MESSAGES)
                .clickOnButton("Produce Message")
                .setContentFiled(fileToString(CONTENT_TO_PRODUCE_MESSAGE))
                .setKeyField(fileToString(KEY_TO_PRODUCE_MESSAGE))
                .submitProduceMessage();
        Assertions.assertTrue(pages.topicView.isKeyMessageVisible(fileToString(KEY_TO_PRODUCE_MESSAGE)));
        Assertions.assertTrue(pages.topicView.isContentMessageVisible(fileToString(CONTENT_TO_PRODUCE_MESSAGE).trim()));
    }

    @AfterAll
    public static void afterAll() {
        ApiHelper apiHelper = Helpers.INSTANCE.apiHelper;
        topicList.forEach(topic -> apiHelper.deleteTopic(CLUSTER_NAME,topic.getName()));
//        Helpers.INSTANCE.apiHelper.deleteTopic(CLUSTER_NAME, TOPIC_TO_UPDATE);
//        Helpers.INSTANCE.apiHelper.deleteTopic(CLUSTER_NAME, TOPIC_TO_DELETE);
//        Helpers.INSTANCE.apiHelper.deleteTopic(CLUSTER_NAME, NEW_TOPIC);
    }
}
