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
    private static final long SUITE_ID = 2;
    private static final String SUITE_TITLE = "Topics";
    private static final Topic TOPIC_FOR_UPDATE = new Topic()
            .setName("topic-to-update")
            .setCompactPolicyValue("Compact")
            .setTimeToRetainData("604800001")
            .setMaxSizeOnDisk("20 GB")
            .setMaxMessageBytes("1000020")
            .setMessageKey(fileToString(System.getProperty("user.dir") + "/src/test/resources/producedkey.txt"))
            .setMessageContent(fileToString(System.getProperty("user.dir") + "/src/test/resources/testData.txt"));
    private static final String TOPIC_NAME_FOR_DELETE = "topic-to-delete";
    private static final List<String> TOPIC_NAME_LIST = new ArrayList<>();

    @BeforeAll
    public static void beforeAll() {
        ApiHelper apiHelper = Helpers.INSTANCE.apiHelper;
        TOPIC_NAME_LIST.addAll(List.of(TOPIC_FOR_UPDATE.getName(), TOPIC_NAME_FOR_DELETE));
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
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady();
        pages.openTopicView(CLUSTER_NAME, TOPIC_FOR_UPDATE.getName())
                .waitUntilScreenReady()
                .openEditSettings()
                .selectCleanupPolicy(TOPIC_FOR_UPDATE.getCompactPolicyValue())
                .setMinInsyncReplicas(10)
                .setTimeToRetainDataInMs(TOPIC_FOR_UPDATE.getTimeToRetainData())
                .setMaxSizeOnDiskInGB(TOPIC_FOR_UPDATE.getMaxSizeOnDisk())
                .setMaxMessageBytes(TOPIC_FOR_UPDATE.getMaxMessageBytes())
                .sendData()
                .waitUntilScreenReady();
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady();
        pages.openTopicView(CLUSTER_NAME, TOPIC_FOR_UPDATE.getName())
                .openEditSettings()
                // Assertions
                .cleanupPolicyIs(TOPIC_FOR_UPDATE.getCompactPolicyValue())
                .timeToRetainIs(TOPIC_FOR_UPDATE.getTimeToRetainData())
                .maxSizeOnDiskIs(TOPIC_FOR_UPDATE.getMaxSizeOnDisk())
                .maxMessageBytesIs(TOPIC_FOR_UPDATE.getMaxMessageBytes());
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
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openTopic(TOPIC_FOR_UPDATE.getName())
                .waitUntilScreenReady()
                .openTopicMenu(TopicView.TopicMenu.MESSAGES)
                .clickOnButton("Produce Message")
                .setContentFiled(TOPIC_FOR_UPDATE.getMessageContent())
                .setKeyField(TOPIC_FOR_UPDATE.getMessageKey())
                .submitProduceMessage();
        Assertions.assertTrue(pages.topicView.isKeyMessageVisible(TOPIC_FOR_UPDATE.getMessageKey()));
        Assertions.assertTrue(pages.topicView.isContentMessageVisible(TOPIC_FOR_UPDATE.getMessageContent().trim()));
    }

    @AfterAll
    public static void afterAll() {
        ApiHelper apiHelper = Helpers.INSTANCE.apiHelper;
        TOPIC_NAME_LIST.forEach(topicName -> apiHelper.deleteTopic(CLUSTER_NAME, topicName));
    }
}
