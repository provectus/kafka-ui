package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.pages.MainPage;
import com.provectus.kafka.ui.pages.topic.TopicCreateEditSettingsView;
import com.provectus.kafka.ui.utils.qaseIO.Status;
import com.provectus.kafka.ui.utils.qaseIO.annotation.AutomationStatus;
import com.provectus.kafka.ui.utils.qaseIO.annotation.Suite;
import io.qameta.allure.Issue;
import io.qase.api.annotation.CaseId;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.*;

import static com.provectus.kafka.ui.extensions.FileUtils.fileToString;

public class TopicTests extends BaseTest {

    public static final String NEW_TOPIC = "new-topic";
    public static final String TOPIC_TO_UPDATE = "topic-to-update";
    public static final String TOPIC_TO_DELETE = "topic-to-delete";
    public static final String COMPACT_POLICY_VALUE = "Compact";
    public static final String UPDATED_TIME_TO_RETAIN_VALUE = "604800001";
    public static final String UPDATED_MAX_SIZE_ON_DISK = "20 GB";
    public static final String UPDATED_MAX_MESSAGE_BYTES = "1000020";
    private static final String KEY_TO_PRODUCE_MESSAGE = System.getProperty("user.dir") + "/src/test/resources/producedkey.txt";
    private static final String CONTENT_TO_PRODUCE_MESSAGE = System.getProperty("user.dir") + "/src/test/resources/testData.txt";


    @BeforeAll
    public static void beforeAll() {
        Helpers.INSTANCE.apiHelper.createTopic(CLUSTER_NAME, TOPIC_TO_UPDATE);
        Helpers.INSTANCE.apiHelper.createTopic(CLUSTER_NAME, TOPIC_TO_DELETE);
    }

    @AfterAll
    public static void afterAll() {
        Helpers.INSTANCE.apiHelper.deleteTopic(CLUSTER_NAME, TOPIC_TO_UPDATE);
        Helpers.INSTANCE.apiHelper.deleteTopic(CLUSTER_NAME, TOPIC_TO_DELETE);
        Helpers.INSTANCE.apiHelper.deleteTopic(CLUSTER_NAME, NEW_TOPIC);
    }

    @DisplayName("should create a topic")
    @Suite(suiteId = 4, title = "Create new Topic")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(199)
    @Test
    public void createTopic() {
        pages.open()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.TOPICS);
        pages.topicsList.pressCreateNewTopic()
                .setTopicName(NEW_TOPIC)
                .sendData()
                .waitUntilScreenReady();
        pages.open()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.TOPICS);
        Assertions.assertTrue(pages.topicsList.isTopicVisible(NEW_TOPIC),"isTopicVisible()");
        helpers.apiHelper.deleteTopic(CLUSTER_NAME, NEW_TOPIC);
        pages.open()
                .goToSideMenu(CLUSTER_NAME, MainPage.SideMenuOptions.TOPICS);
        Assertions.assertFalse(pages.topicsList.isTopicVisible(NEW_TOPIC),"isTopicVisible()");
    }

    @DisplayName("should update a topic")
    @Issue("1500")
    @Suite(suiteId = 2, title = "Topics")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(197)
    @Test
    public void updateTopic() {
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openTopic(TOPIC_TO_UPDATE)
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
    @Suite(suiteId = 2, title = "Topics")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(207)
    @Test
    public void deleteTopic() {
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openTopic(TOPIC_TO_DELETE)
                .waitUntilScreenReady()
                .deleteTopic();
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady();
        Assertions.assertFalse(pages.topicsList.isTopicVisible(TOPIC_TO_DELETE),"isTopicVisible");
    }

    @DisplayName("produce message")
    @Suite(suiteId = 2, title = "Topics")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(222)
    @Test
    void produceMessage() {
        pages.openTopicsList(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openTopic(TOPIC_TO_UPDATE)
                .waitUntilScreenReady()
                .clickOnButton("Produce Message")
                .setContentFiled(fileToString(CONTENT_TO_PRODUCE_MESSAGE))
                .setKeyField(fileToString(KEY_TO_PRODUCE_MESSAGE))
                .submitProduceMessage();
        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(pages.topicView.isKeyMessageVisible(fileToString(KEY_TO_PRODUCE_MESSAGE ))).withFailMessage("isKeyMessageVisible()").isTrue();
        softly.assertThat(pages.topicView.isContentMessageVisible(fileToString(CONTENT_TO_PRODUCE_MESSAGE).trim())).withFailMessage("isContentMessageVisible()").isTrue();
        softly.assertAll();
    }
}
