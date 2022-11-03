package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.models.Topic;
import com.provectus.kafka.ui.pages.topic.TopicDetails;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.Suite;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qameta.allure.Issue;
import io.qase.api.annotation.CaseId;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.*;

import java.util.ArrayList;
import java.util.List;

import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.TOPICS;
import static com.provectus.kafka.ui.pages.topic.TopicCreateEditForm.CleanupPolicyValue.COMPACT;
import static com.provectus.kafka.ui.pages.topic.TopicCreateEditForm.CleanupPolicyValue.DELETE;
import static com.provectus.kafka.ui.pages.topic.TopicCreateEditForm.MaxSizeOnDisk.SIZE_20_GB;
import static com.provectus.kafka.ui.settings.Source.CLUSTER_NAME;
import static com.provectus.kafka.ui.utilities.FileUtils.fileToString;
import static org.apache.commons.lang.RandomStringUtils.randomAlphabetic;
import static org.assertj.core.api.Assertions.assertThat;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class TopicTests extends BaseTest {
    private static final long SUITE_ID = 2;
    private static final String SUITE_TITLE = "Topics";
    private static final Topic TOPIC_TO_CREATE = new Topic()
            .setName("new-topic-"+ randomAlphabetic(5))
            .setPartitions("1")
            .setCleanupPolicyValue(DELETE);
    private static final Topic TOPIC_FOR_UPDATE = new Topic()
            .setName("topic-to-update-" + randomAlphabetic(5))
            .setCleanupPolicyValue(COMPACT)
            .setTimeToRetainData("604800001")
            .setMaxSizeOnDisk(SIZE_20_GB)
            .setMaxMessageBytes("1000020")
            .setMessageKey(fileToString(System.getProperty("user.dir") + "/src/test/resources/producedkey.txt"))
            .setMessageContent(fileToString(System.getProperty("user.dir") + "/src/test/resources/testData.txt"));
    private static final Topic TOPIC_FOR_MESSAGES = new Topic()
            .setName("topic-with-clean-message-attribute-" + randomAlphabetic(5))
            .setMessageKey(fileToString(System.getProperty("user.dir") + "/src/test/resources/producedkey.txt"))
            .setMessageContent(fileToString(System.getProperty("user.dir") + "/src/test/resources/testData.txt"));

    private static final Topic TOPIC_FOR_DELETE = new Topic().setName("topic-to-delete-" + randomAlphabetic(5));
    private static final List<Topic> TOPIC_LIST = new ArrayList<>();

    @BeforeAll
    public void beforeAll() {
        TOPIC_LIST.addAll(List.of(TOPIC_FOR_UPDATE, TOPIC_FOR_DELETE, TOPIC_FOR_MESSAGES));
        TOPIC_LIST.forEach(topic -> apiHelper.createTopic(CLUSTER_NAME, topic.getName()));
    }

    @DisplayName("should create a topic")
    @Suite(suiteId = 4, title = "Create new Topic")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(199)
    @Test
    public void createTopic() {
        naviSideBar
                .openSideMenu(TOPICS);
        topicsList
                .waitUntilScreenReady()
                .clickAddTopicBtn();
        topicCreateEditForm
                .waitUntilScreenReady()
                .setTopicName(TOPIC_TO_CREATE.getName())
                .setPartitions(TOPIC_TO_CREATE.getPartitions())
                .selectCleanupPolicy(TOPIC_TO_CREATE.getCleanupPolicyValue())
                .clickCreateTopicBtn();
        topicDetails
                .waitUntilScreenReady();
        naviSideBar
                .openSideMenu(TOPICS);
        topicsList
                .waitUntilScreenReady()
                .openTopic(TOPIC_TO_CREATE.getName());
        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(topicDetails.isTopicHeaderVisible(TOPIC_TO_CREATE.getName())).as("isTopicHeaderVisible()").isTrue();
        softly.assertThat(topicDetails.getCleanUpPolicy()).as("getCleanUpPolicy()").isEqualTo(TOPIC_TO_CREATE.getCleanupPolicyValue().toString());
        softly.assertThat(topicDetails.getPartitions()).as("getPartitions()").isEqualTo(TOPIC_TO_CREATE.getPartitions());
        softly.assertAll();
        naviSideBar
                .openSideMenu(TOPICS);
        topicsList
                .waitUntilScreenReady();
        Assertions.assertTrue(topicsList.isTopicVisible(TOPIC_TO_CREATE.getName()), "isTopicVisible");
        TOPIC_LIST.add(TOPIC_TO_CREATE);
    }

    @Disabled("https://github.com/provectus/kafka-ui/issues/2625")
    @DisplayName("should update a topic")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(197)
    @Test
    public void updateTopic() {
        naviSideBar
                .openSideMenu(TOPICS);
        topicsList
                .waitUntilScreenReady()
                .openTopic(TOPIC_FOR_UPDATE.getName());
        topicDetails
                .waitUntilScreenReady()
                .openEditSettings();
        topicCreateEditForm
                .waitUntilScreenReady()
                .selectCleanupPolicy((TOPIC_FOR_UPDATE.getCleanupPolicyValue()))
                .setMinInsyncReplicas(10)
                .setTimeToRetainDataInMs(TOPIC_FOR_UPDATE.getTimeToRetainData())
                .setMaxSizeOnDiskInGB(TOPIC_FOR_UPDATE.getMaxSizeOnDisk())
                .setMaxMessageBytes(TOPIC_FOR_UPDATE.getMaxMessageBytes())
                .clickCreateTopicBtn();
        topicDetails
                .waitUntilScreenReady();
        naviSideBar
                .openSideMenu(TOPICS);
        topicsList
                .waitUntilScreenReady()
                .openTopic(TOPIC_FOR_UPDATE.getName());
        topicDetails
                .waitUntilScreenReady()
                .openEditSettings();
        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(topicCreateEditForm.getCleanupPolicy()).as("getCleanupPolicy()").isEqualTo(TOPIC_FOR_UPDATE.getCleanupPolicyValue().getVisibleText());
        softly.assertThat(topicCreateEditForm.getTimeToRetain()).as("getTimeToRetain()").isEqualTo(TOPIC_FOR_UPDATE.getTimeToRetainData());
        softly.assertThat(topicCreateEditForm.getMaxSizeOnDisk()).as("getMaxSizeOnDisk()").isEqualTo(TOPIC_FOR_UPDATE.getMaxSizeOnDisk().getVisibleText());
        softly.assertThat(topicCreateEditForm.getMaxMessageBytes()).as("getMaxMessageBytes()").isEqualTo(TOPIC_FOR_UPDATE.getMaxMessageBytes());
        softly.assertAll();
    }

    @DisplayName("should delete topic")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(207)
    @Test
    public void deleteTopic() {
        naviSideBar
                .openSideMenu(TOPICS);
        topicsList
                .waitUntilScreenReady()
                .openTopic(TOPIC_FOR_DELETE.getName());
        topicDetails
                .waitUntilScreenReady()
                .deleteTopic();
        naviSideBar
                .openSideMenu(TOPICS);
        topicsList
                .waitUntilScreenReady();
        Assertions.assertFalse(topicsList.isTopicVisible(TOPIC_FOR_DELETE.getName()), "isTopicVisible");
        TOPIC_LIST.remove(TOPIC_FOR_DELETE);
    }

    @DisplayName("produce message")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(222)
    @Test
    void produceMessage() {
        naviSideBar
                .openSideMenu(TOPICS);
        topicsList
                .waitUntilScreenReady()
                .openTopic(TOPIC_FOR_MESSAGES.getName());
        topicDetails
                .waitUntilScreenReady()
                .openTopicMenu(TopicDetails.TopicMenu.MESSAGES)
                .clickProduceMessageBtn();
        produceMessagePanel
                .waitUntilScreenReady()
                .setContentFiled(TOPIC_FOR_MESSAGES.getMessageContent())
                .setKeyField(TOPIC_FOR_MESSAGES.getMessageKey())
                .submitProduceMessage();
        topicDetails
                .waitUntilScreenReady();
        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(topicDetails.isKeyMessageVisible((TOPIC_FOR_MESSAGES.getMessageKey()))).withFailMessage("isKeyMessageVisible()").isTrue();
        softly.assertThat(topicDetails.isContentMessageVisible((TOPIC_FOR_MESSAGES.getMessageContent()).trim())).withFailMessage("isContentMessageVisible()").isTrue();
        softly.assertAll();
    }

    @Issue("Uncomment last assertion after bug https://github.com/provectus/kafka-ui/issues/2778 fix")
    @DisplayName("clear message")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(19)
    @Test
    void clearMessage() {
        naviSideBar
                .openSideMenu(TOPICS);
        topicsList
                .waitUntilScreenReady()
                .openTopic(TOPIC_FOR_MESSAGES.getName());
        topicDetails
                .waitUntilScreenReady()
                .openTopicMenu(TopicDetails.TopicMenu.OVERVIEW)
                .clickProduceMessageBtn();
        produceMessagePanel
                .waitUntilScreenReady()
                .setContentFiled(TOPIC_FOR_MESSAGES.getMessageContent())
                .setKeyField(TOPIC_FOR_MESSAGES.getMessageKey())
                .submitProduceMessage();
        topicDetails
                .waitUntilScreenReady();
        String messageAmount = topicDetails.MessageCountAmount();
        assertThat(messageAmount)
                .withFailMessage("message amount not equals").isEqualTo(topicDetails.MessageCountAmount());
        topicDetails
                .openDotPartitionIdMenu()
                .clickClearMessagesBtn();
//        assertThat(Integer.toString(Integer.valueOf(messageAmount)-1))
//                .withFailMessage("message amount not decrease by one").isEqualTo(topicDetails.MessageCountAmount());
    }

    @DisplayName("Redirect to consumer from topic profile")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(20)
    @Test
    void redirectToConsumerFromTopic() {
        String topicName = "source-activities";
        String consumerGroupId = "connect-sink_postgres_activities";
        naviSideBar
                .openSideMenu(TOPICS);
        topicsList
                .waitUntilScreenReady()
                .openTopic(topicName);
        topicDetails
                .waitUntilScreenReady()
                .openTopicMenu(TopicDetails.TopicMenu.CONSUMERS)
                .openConsumerGroup(consumerGroupId);
        consumersDetails
                .waitUntilScreenReady();
        assertThat(consumersDetails.isRedirectedConsumerTitleVisible(consumerGroupId))
                .withFailMessage("isRedirectedConsumerTitleVisible").isTrue();
        assertThat(consumersDetails.isTopicInConsumersDetailsVisible(topicName))
                .withFailMessage("isTopicInConsumersDetailsVisible").isTrue();
    }

    @AfterAll
    public void afterAll() {
        TOPIC_LIST.forEach(topic -> apiHelper.deleteTopic(CLUSTER_NAME, topic.getName()));
    }
}
