package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.models.Topic;
import com.provectus.kafka.ui.pages.MainPage;
import com.provectus.kafka.ui.pages.topic.TopicCreateEditSettingsView;
import com.provectus.kafka.ui.utils.qaseIO.Status;
import com.provectus.kafka.ui.utils.qaseIO.annotation.AutomationStatus;
import com.provectus.kafka.ui.utils.qaseIO.annotation.Suite;
import io.qameta.allure.Issue;
import io.qase.api.annotation.CaseId;
import org.assertj.core.api.SoftAssertions;
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
    private static final Topic TOPIC_FOR_DELETE = new Topic().setName("topic-to-delete");
    private static final List<Topic> TOPIC_LIST = new ArrayList<>();

    @BeforeAll
    public static void beforeAll() {
        TOPIC_LIST.addAll(List.of(TOPIC_FOR_UPDATE, TOPIC_FOR_DELETE));
        TOPIC_LIST.forEach(topic -> Helpers.INSTANCE.apiHelper.createTopic(CLUSTER_NAME, topic.getName()));
    }

    @DisplayName("should create a topic")
    @Suite(suiteId = 4, title = "Create new Topic")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(199)
    @Test
    public void createTopic() {
        Topic topicToCreate = new Topic().setName("new-topic");
        pages.open()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.TOPICS);
        pages.topicsList.pressCreateNewTopic()
                .setTopicName(topicToCreate.getName())
                .sendData()
                .waitUntilScreenReady();
        pages.open()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.TOPICS)
                .topicIsVisible(topicToCreate.getName());
        TOPIC_LIST.add(topicToCreate);
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
                .waitUntilScreenReady()
                .openTopic(TOPIC_TO_UPDATE)
                .waitUntilScreenReady()
                .openEditSettings();
        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(new TopicCreateEditSettingsView().getCleanupPolicy()).as("Cleanup Policy").isEqualTo(COMPACT_POLICY_VALUE);
        softly.assertThat(new TopicCreateEditSettingsView().getTimeToRetain()).as("Time to retain").isEqualTo(UPDATED_TIME_TO_RETAIN_VALUE);
        softly.assertThat(new TopicCreateEditSettingsView().getMaxSizeOnDisk()).as("Max size on disk").isEqualTo(UPDATED_MAX_SIZE_ON_DISK);
        softly.assertThat(new TopicCreateEditSettingsView().getMaxMessageBytes()).as("Max message bytes").isEqualTo(UPDATED_MAX_MESSAGE_BYTES);
        softly.assertAll();
    }

    @DisplayName("should delete topic")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(207)
    @Test
    public void deleteTopic() {
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openTopic(TOPIC_FOR_DELETE.getName())
                .waitUntilScreenReady()
                .deleteTopic();
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .isTopicNotVisible(TOPIC_FOR_DELETE.getName());
        TOPIC_LIST.remove(TOPIC_FOR_DELETE);
                .waitUntilScreenReady();
        Assertions.assertFalse(pages.topicsList.isTopicVisible(TOPIC_TO_DELETE),"isTopicVisible");
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
        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(pages.topicView.isKeyMessageVisible(fileToString(KEY_TO_PRODUCE_MESSAGE ))).withFailMessage("isKeyMessageVisible()").isTrue();
        softly.assertThat(pages.topicView.isContentMessageVisible(fileToString(CONTENT_TO_PRODUCE_MESSAGE).trim())).withFailMessage("isContentMessageVisible()").isTrue();
        softly.assertAll();
        Assertions.assertTrue(pages.topicView.isKeyMessageVisible(TOPIC_FOR_UPDATE.getMessageKey()));
        Assertions.assertTrue(pages.topicView.isContentMessageVisible(TOPIC_FOR_UPDATE.getMessageContent().trim()));
    }

    @AfterAll
    public static void afterAll() {
        TOPIC_LIST.forEach(topic -> Helpers.INSTANCE.apiHelper.deleteTopic(CLUSTER_NAME, topic.getName()));
    }
}
