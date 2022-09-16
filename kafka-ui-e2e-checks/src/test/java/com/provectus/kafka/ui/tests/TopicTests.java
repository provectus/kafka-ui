package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.helpers.ApiHelper;
import com.provectus.kafka.ui.helpers.Helpers;
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
    private static final long SUITE_ID = 2;
    private static final String SUITE_TITLE = "Topics";
    private static final String TOPIC_NAME_FOR_UPDATE = "topic-to-update";
    private static final String TOPIC_NAME_FOR_DELETE = "topic-to-delete";
    private static final List<String> TOPIC_NAME_LIST = new ArrayList<>();

    @BeforeAll
    public static void beforeAll() {
        ApiHelper apiHelper = Helpers.INSTANCE.apiHelper;
        TOPIC_NAME_LIST.addAll(List.of(TOPIC_NAME_FOR_UPDATE, TOPIC_NAME_FOR_DELETE));
        TOPIC_NAME_LIST.forEach(topicName -> apiHelper.createTopic(CLUSTER_NAME, topicName));
    }

    @DisplayName("should create a topic")
    @Suite(suiteId = 4, title = "Create new Topic")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(199)
    @Test
    public void createTopic() {
        String topicName = "new-topic";
        pages.open()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.TOPICS);
        pages.topicsList.pressCreateNewTopic()
                .setTopicName(topicName)
                .sendData()
                .waitUntilScreenReady();
        pages.open()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.TOPICS)
                .topicIsVisible(topicName);
        TOPIC_NAME_LIST.add(topicName);
    }

    @Disabled("Due to issue https://github.com/provectus/kafka-ui/issues/1500 ignore this test")
    @DisplayName("should update a topic")
    @Issue("1500")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(197)
    @Test
    public void updateTopic() {
        String compactPolicyValue = "Compact";
        String updatedTimeToRetainValue = "604800001";
        String updatedMaxSizeOnDisk = "20 GB";
        String updatedMaxMessageBytes = "1000020";
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady();
        pages.openTopicView(CLUSTER_NAME, TOPIC_NAME_FOR_UPDATE)
                .waitUntilScreenReady()
                .openEditSettings()
                .selectCleanupPolicy(compactPolicyValue)
                .setMinInsyncReplicas(10)
                .setTimeToRetainDataInMs(updatedTimeToRetainValue)
                .setMaxSizeOnDiskInGB(updatedMaxSizeOnDisk)
                .setMaxMessageBytes(updatedMaxMessageBytes)
                .sendData()
                .waitUntilScreenReady();
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady();
        pages.openTopicView(CLUSTER_NAME, TOPIC_NAME_FOR_UPDATE)
                .openEditSettings()
                // Assertions
                .cleanupPolicyIs(compactPolicyValue)
                .timeToRetainIs(updatedTimeToRetainValue)
                .maxSizeOnDiskIs(updatedMaxSizeOnDisk)
                .maxMessageBytesIs(updatedMaxMessageBytes);
    }

    @DisplayName("should delete topic")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(207)
    @Test
    public void deleteTopic() {
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openTopic(TOPIC_NAME_FOR_DELETE)
                .waitUntilScreenReady()
                .deleteTopic();
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .isTopicNotVisible(TOPIC_NAME_FOR_DELETE);
        TOPIC_NAME_LIST.remove(TOPIC_NAME_FOR_DELETE);
    }

    @DisplayName("produce message")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(222)
    @Test
    void produceMessage() {
        String messageKey = fileToString(System.getProperty("user.dir") + "/src/test/resources/producedkey.txt");
        String messageContent = fileToString(System.getProperty("user.dir") + "/src/test/resources/testData.txt");
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openTopic(TOPIC_NAME_FOR_UPDATE)
                .waitUntilScreenReady()
                .openTopicMenu(TopicView.TopicMenu.MESSAGES)
                .clickOnButton("Produce Message")
                .setContentFiled(messageContent)
                .setKeyField(messageKey)
                .submitProduceMessage();
        Assertions.assertTrue(pages.topicView.isKeyMessageVisible(messageKey));
        Assertions.assertTrue(pages.topicView.isContentMessageVisible(messageContent.trim()));
    }

    @AfterAll
    public static void afterAll() {
        ApiHelper apiHelper = Helpers.INSTANCE.apiHelper;
        TOPIC_NAME_LIST.forEach(topicName -> apiHelper.deleteTopic(CLUSTER_NAME, topicName));
    }
}
