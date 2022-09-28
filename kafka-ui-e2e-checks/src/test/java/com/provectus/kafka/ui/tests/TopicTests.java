package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.models.Topic;
import com.provectus.kafka.ui.pages.topic.TopicView;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.Suite;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qase.api.annotation.CaseId;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.*;

import java.util.ArrayList;
import java.util.List;

import static com.provectus.kafka.ui.utilities.FileUtils.fileToString;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
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
    public void beforeAll() {
        TOPIC_LIST.addAll(List.of(TOPIC_FOR_UPDATE, TOPIC_FOR_DELETE));
        TOPIC_LIST.forEach(topic -> apiHelper.createTopic(CLUSTER_NAME, topic.getName()));
    }

    @DisplayName("should create a topic")
    @Suite(suiteId = 4, title = "Create new Topic")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(199)
    @Test
    public void createTopic() {
        Topic topicToCreate = new Topic().setName("new-topic");
        topicsList.goTo(CLUSTER_NAME)
                .waitUntilScreenReady()
                .pressCreateNewTopic()
                .setTopicName(topicToCreate.getName())
                .sendData()
                .waitUntilScreenReady();
        topicsList.goTo(CLUSTER_NAME)
                .waitUntilScreenReady();
        Assertions.assertTrue(topicsList.isTopicVisible(topicToCreate.getName()), "isTopicVisible");
        TOPIC_LIST.add(topicToCreate);
    }

    @Disabled("https://github.com/provectus/kafka-ui/issues/2625")
    @DisplayName("should update a topic")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(197)
    @Test
    public void updateTopic() {
        topicsList.goTo(CLUSTER_NAME)
                .waitUntilScreenReady();
        topicsList.openTopic(TOPIC_FOR_UPDATE.getName())
                .waitUntilScreenReady()
                .openEditSettings()
                .selectCleanupPolicy(TOPIC_FOR_UPDATE.getCompactPolicyValue())
                .setMinInsyncReplicas(10)
                .setTimeToRetainDataInMs(TOPIC_FOR_UPDATE.getTimeToRetainData())
                .setMaxSizeOnDiskInGB(TOPIC_FOR_UPDATE.getMaxSizeOnDisk())
                .setMaxMessageBytes(TOPIC_FOR_UPDATE.getMaxMessageBytes())
                .sendData()
                .waitUntilScreenReady();
        topicsList.goTo(CLUSTER_NAME)
                .waitUntilScreenReady();
        topicsList.openTopic(TOPIC_FOR_UPDATE.getName())
                .waitUntilScreenReady()
                .openEditSettings();
        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(topicCreateEditSettingsView.getCleanupPolicy()).as("Cleanup Policy").isEqualTo(TOPIC_FOR_UPDATE.getCompactPolicyValue());
        softly.assertThat(topicCreateEditSettingsView.getTimeToRetain()).as("Time to retain").isEqualTo(TOPIC_FOR_UPDATE.getTimeToRetainData());
        softly.assertThat(topicCreateEditSettingsView.getMaxSizeOnDisk()).as("Max size on disk").isEqualTo(TOPIC_FOR_UPDATE.getMaxSizeOnDisk());
        softly.assertThat(topicCreateEditSettingsView.getMaxMessageBytes()).as("Max message bytes").isEqualTo(TOPIC_FOR_UPDATE.getMaxMessageBytes());
        softly.assertAll();
    }

    @DisplayName("should delete topic")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(207)
    @Test
    public void deleteTopic() {
        topicsList.goTo(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openTopic(TOPIC_FOR_DELETE.getName())
                .waitUntilScreenReady()
                .deleteTopic();
        topicsList.goTo(CLUSTER_NAME)
                .waitUntilScreenReady();
        Assertions.assertFalse(topicsList.isTopicVisible(TOPIC_FOR_DELETE.getName()),"isTopicVisible");
        TOPIC_LIST.remove(TOPIC_FOR_DELETE);
    }

    @DisplayName("produce message")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(222)
    @Test
    void produceMessage() {
        topicsList.goTo(CLUSTER_NAME)
                .waitUntilScreenReady()
                .openTopic(TOPIC_FOR_UPDATE.getName())
                .waitUntilScreenReady()
                .openTopicMenu(TopicView.TopicMenu.MESSAGES)
                .clickOnButton("Produce Message")
                .setContentFiled(TOPIC_FOR_UPDATE.getMessageContent())
                .setKeyField(TOPIC_FOR_UPDATE.getMessageKey())
                .submitProduceMessage();
        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(topicView.isKeyMessageVisible((TOPIC_FOR_UPDATE.getMessageKey()))).withFailMessage("isKeyMessageVisible()").isTrue();
        softly.assertThat(topicView.isContentMessageVisible((TOPIC_FOR_UPDATE.getMessageContent()).trim())).withFailMessage("isContentMessageVisible()").isTrue();
        softly.assertAll();
    }

    @AfterAll
    public void afterAll() {
        TOPIC_LIST.forEach(topic -> apiHelper.deleteTopic(CLUSTER_NAME, topic.getName()));
    }
}
