package com.provectus.kafka.ui.tests;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.helpers.Helpers;
import com.provectus.kafka.ui.pages.MainPage;
import com.provectus.kafka.ui.steps.kafka.TopicSteps;
import com.provectus.kafka.ui.utils.qaseIO.Status;
import com.provectus.kafka.ui.utils.qaseIO.annotation.AutomationStatus;
import com.provectus.kafka.ui.utils.qaseIO.annotation.Suite;
import io.qameta.allure.Issue;
import io.qase.api.annotation.CaseId;
import lombok.SneakyThrows;
import org.junit.jupiter.api.*;

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
    private static final String KEY_TO_PRODUCE_MESSAGE = System.getProperty("user.dir") + "/src/test/resources/producedkey.txt";
    private static final String CONTENT_TO_PRODUCE_MESSAGE = System.getProperty("user.dir") + "/src/test/resources/testData.txt";


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
        Helpers.INSTANCE.apiHelper.deleteTopic(SECOND_LOCAL, NEW_TOPIC);
    }

    @SneakyThrows
    @DisplayName("should create a topic")
    @Suite(suiteId = 4, title = "Create new Topic")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(199)
    @Test
    public void createTopic() {
        pages.open()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.TOPICS);
        TopicSteps.createNewTopic(NEW_TOPIC)
                .isOnTopicViewPage();
        pages.open()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.TOPICS);
        Assertions.assertTrue(TopicSteps.IsTopicVisible(NEW_TOPIC));
    }


    @SneakyThrows
    @DisplayName("should update a topic")
    @Issue("1500")
    @Suite(suiteId = 2, title = "Topics")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(197)
    @Test
    public void updateTopic() {
        pages.open()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.TOPICS);
        TopicSteps.updateTopic(TOPIC_TO_UPDATE, COMPACT_POLICY_VALUE, UPDATED_TIME_TO_RETAIN_VALUE, UPDATED_MAX_SIZE_ON_DISK, UPDATED_MAX_MESSAGE_BYTES);
    }

    @SneakyThrows
    @DisplayName("should delete topic")
    @Suite(suiteId = 2, title = "Topics")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(207)
    @Test
    public void deleteTopic() {
        pages.open()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.TOPICS);
        TopicSteps.deleteTopic(TOPIC_TO_DELETE);
        Assertions.assertFalse(TopicSteps.isTopicNotVisible(TOPIC_TO_DELETE));
    }

    @SneakyThrows
    @DisplayName("produce message")
    @Suite(suiteId = 2, title = "Topics")
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(222)
    @Test
    void produceMessage() {
        pages.open()
                .goToSideMenu(SECOND_LOCAL, MainPage.SideMenuOptions.TOPICS);
        TopicSteps.produceMessage(TOPIC_TO_UPDATE, CONTENT_TO_PRODUCE_MESSAGE, KEY_TO_PRODUCE_MESSAGE);
        Assertions.assertTrue(TopicSteps.isKeyMessageVisible(readFileAsString(KEY_TO_PRODUCE_MESSAGE)));
        Assertions.assertTrue(TopicSteps.isContentMessageVisible(readFileAsString(CONTENT_TO_PRODUCE_MESSAGE).trim()));
    }
}
