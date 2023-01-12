package com.provectus.kafka.ui.suite.topics;

import static com.provectus.kafka.ui.pages.BasePage.AlertHeader.SUCCESS;
import static com.provectus.kafka.ui.pages.topic.TopicDetails.TopicMenu.MESSAGES;
import static com.provectus.kafka.ui.settings.BaseSource.CLUSTER_NAME;
import static com.provectus.kafka.ui.utilities.FileUtils.fileToString;
import static org.apache.commons.lang.RandomStringUtils.randomAlphabetic;
import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.base.BaseTest;
import com.provectus.kafka.ui.models.Topic;
import com.provectus.kafka.ui.pages.topic.TopicDetails;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.Suite;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qameta.allure.Issue;
import io.qase.api.annotation.CaseId;
import java.util.ArrayList;
import java.util.List;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class TopicMessagesTests extends BaseTest {
  private static final long SUITE_ID = 2;
  private static final String SUITE_TITLE = "Topics";
  private static final Topic TOPIC_FOR_MESSAGES = new Topic()
      .setName("topic-with-clean-message-attribute-" + randomAlphabetic(5))
      .setMessageKey(fileToString(System.getProperty("user.dir") + "/src/test/resources/producedkey.txt"))
      .setMessageContent(fileToString(System.getProperty("user.dir") + "/src/test/resources/testData.txt"));
  private static final Topic TOPIC_TO_CLEAR_MESSAGES = new Topic()
      .setName("topic-to-clear-message-attribute-" + randomAlphabetic(5))
      .setMessageKey(fileToString(System.getProperty("user.dir") + "/src/test/resources/producedkey.txt"))
      .setMessageContent(fileToString(System.getProperty("user.dir") + "/src/test/resources/testData.txt"));
  private static final Topic TOPIC_TO_RECREATE = new Topic()
      .setName("topic-to-recreate-attribute-" + randomAlphabetic(5))
      .setMessageKey(fileToString(System.getProperty("user.dir") + "/src/test/resources/producedkey.txt"))
      .setMessageContent(fileToString(System.getProperty("user.dir") + "/src/test/resources/testData.txt"));
  private static final List<Topic> TOPIC_LIST = new ArrayList<>();

  @BeforeAll
  public void beforeAll() {
    TOPIC_LIST.addAll(List.of(TOPIC_FOR_MESSAGES, TOPIC_TO_CLEAR_MESSAGES, TOPIC_TO_RECREATE));
    TOPIC_LIST.forEach(topic -> apiService.createTopic(CLUSTER_NAME, topic.getName()));
  }

  @DisplayName("produce message")
  @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
  @AutomationStatus(status = Status.AUTOMATED)
  @CaseId(222)
  @Test
  void produceMessage() {
    navigateToTopicsAndOpenDetails(TOPIC_FOR_MESSAGES.getName());
    topicDetails
        .openDetailsTab(TopicDetails.TopicMenu.MESSAGES)
        .clickProduceMessageBtn();
    produceMessagePanel
        .waitUntilScreenReady()
        .setContentFiled(TOPIC_FOR_MESSAGES.getMessageContent())
        .setKeyField(TOPIC_FOR_MESSAGES.getMessageKey())
        .submitProduceMessage();
    topicDetails
        .waitUntilScreenReady();
    SoftAssertions softly = new SoftAssertions();
    softly.assertThat(topicDetails.isKeyMessageVisible((TOPIC_FOR_MESSAGES.getMessageKey())))
        .withFailMessage("isKeyMessageVisible()").isTrue();
    softly.assertThat(topicDetails.isContentMessageVisible((TOPIC_FOR_MESSAGES.getMessageContent()).trim()))
        .withFailMessage("isContentMessageVisible()").isTrue();
    softly.assertAll();
  }

  @Disabled
  @Issue("https://github.com/provectus/kafka-ui/issues/2778")
  @DisplayName("clear message")
  @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
  @AutomationStatus(status = Status.AUTOMATED)
  @CaseId(19)
  @Test
  void clearMessage() {
    navigateToTopicsAndOpenDetails(TOPIC_FOR_MESSAGES.getName());
    topicDetails
        .openDetailsTab(TopicDetails.TopicMenu.OVERVIEW)
        .clickProduceMessageBtn();
    int messageAmount = topicDetails.getMessageCountAmount();
    produceMessagePanel
        .waitUntilScreenReady()
        .setContentFiled(TOPIC_FOR_MESSAGES.getMessageContent())
        .setKeyField(TOPIC_FOR_MESSAGES.getMessageKey())
        .submitProduceMessage();
    topicDetails
        .waitUntilScreenReady();
    Assertions.assertEquals(messageAmount + 1, topicDetails.getMessageCountAmount(), "getMessageCountAmount()");
    topicDetails
        .openDotMenu()
        .clickClearMessagesMenu()
        .waitUntilScreenReady();
    Assertions.assertEquals(0, topicDetails.getMessageCountAmount(), "getMessageCountAmount()");
  }

  @Disabled
  @Issue("https://github.com/provectus/kafka-ui/issues/2819")
  @DisplayName("Message copy from topic profile")
  @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
  @AutomationStatus(status = Status.AUTOMATED)
  @CaseId(21)
  @Test
  void copyMessageFromTopicProfile() {
    navigateToTopicsAndOpenDetails("_schemas");
    topicDetails
        .openDetailsTab(TopicDetails.TopicMenu.MESSAGES)
        .getRandomMessage()
        .openDotMenu()
        .clickCopyToClipBoard();
    Assertions.assertTrue(topicDetails.isAlertWithMessageVisible(SUCCESS,"Copied successfully!"),
        "isAlertWithMessageVisible()");
  }

  @Disabled
  @Issue("https://github.com/provectus/kafka-ui/issues/2856")
  @DisplayName("Checking messages filtering by Offset within Topic/Messages")
  @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
  @AutomationStatus(status = Status.AUTOMATED)
  @CaseId(15)
  @Test
  void checkingMessageFilteringByOffset() {
    String offsetValue = "2";
    navigateToTopicsAndOpenDetails("_schemas");
    topicDetails
        .openDetailsTab(MESSAGES)
        .selectSeekTypeDdlMessagesTab("Offset")
        .setSeekTypeValueFldMessagesTab(offsetValue)
        .clickSubmitFiltersBtnMessagesTab();
    SoftAssertions softly = new SoftAssertions();
    topicDetails.getAllMessages()
        .forEach(messages -> softly.assertThat(messages.getOffset() == Integer.parseInt(offsetValue))
        .as("getAllMessages()").isTrue());
    softly.assertAll();
  }

  @DisplayName("TopicTests.clearMessageOfTopic : Clear message of topic")
  @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
  @AutomationStatus(status = Status.AUTOMATED)
  @CaseId(239)
  @Test
  void checkClearTopicMessage() {
    navigateToTopicsAndOpenDetails(TOPIC_TO_CLEAR_MESSAGES.getName());
    topicDetails
        .openDetailsTab(TopicDetails.TopicMenu.OVERVIEW)
        .clickProduceMessageBtn();
    produceMessagePanel
        .waitUntilScreenReady()
        .setContentFiled(TOPIC_TO_CLEAR_MESSAGES.getMessageContent())
        .setKeyField(TOPIC_TO_CLEAR_MESSAGES.getMessageKey())
        .submitProduceMessage();
    topicDetails
        .waitUntilScreenReady();
    navigateToTopics();
    topicsList
        .waitUntilScreenReady();
    assertThat(topicsList.getTopicItem(TOPIC_TO_CLEAR_MESSAGES.getName()).getNumberOfMessages())
        .as("getNumberOfMessages()").isEqualTo(1);
    topicsList
        .openDotMenuByTopicName(TOPIC_TO_CLEAR_MESSAGES.getName())
        .clickClearMessagesBtn()
        .clickConfirmBtnMdl();
    SoftAssertions softly = new SoftAssertions();
    softly.assertThat(topicsList.isAlertWithMessageVisible(SUCCESS,
        String.format("%s messages have been successfully cleared!",TOPIC_TO_CLEAR_MESSAGES.getName())))
        .as("isAlertWithMessageVisible()").isTrue();
    softly.assertThat(topicsList.getTopicItem(TOPIC_TO_CLEAR_MESSAGES.getName()).getNumberOfMessages())
        .as("getNumberOfMessages()").isEqualTo(0);
    softly.assertAll();
  }

  @DisplayName("TopicTests.recreateTopic : Recreate topic")
  @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
  @AutomationStatus(status = Status.AUTOMATED)
  @CaseId(240)
  @Test
  void checkRecreateTopic(){
    navigateToTopicsAndOpenDetails(TOPIC_TO_RECREATE.getName());
    topicDetails
        .openDetailsTab(TopicDetails.TopicMenu.OVERVIEW)
        .clickProduceMessageBtn();
    produceMessagePanel
        .waitUntilScreenReady()
        .setContentFiled(TOPIC_TO_RECREATE.getMessageContent())
        .setKeyField(TOPIC_TO_RECREATE.getMessageKey())
        .submitProduceMessage();
    topicDetails
        .waitUntilScreenReady();
    navigateToTopics();
    topicsList
        .waitUntilScreenReady();
    assertThat(topicsList.getTopicItem(TOPIC_TO_RECREATE.getName()).getNumberOfMessages())
        .as("getNumberOfMessages()").isEqualTo(1);
    topicsList
        .openDotMenuByTopicName(TOPIC_TO_RECREATE.getName())
        .clickRecreateTopicBtn()
        .clickConfirmBtnMdl();
    SoftAssertions softly = new SoftAssertions();
    softly.assertThat(topicDetails.isAlertWithMessageVisible(SUCCESS,
            String.format("Topic %s successfully recreated!", TOPIC_TO_RECREATE.getName())))
        .as("isAlertWithMessageVisible()").isTrue();
    softly.assertThat(topicsList.getTopicItem(TOPIC_TO_RECREATE.getName()).getNumberOfMessages())
        .as("getNumberOfMessages()").isEqualTo(0);
    softly.assertAll();
  }

  @AfterAll
  public void afterAll() {
    TOPIC_LIST.forEach(topic -> apiService.deleteTopic(CLUSTER_NAME, topic.getName()));
  }
}
