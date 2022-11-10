package com.provectus.kafka.ui.suite.topics;

import static com.provectus.kafka.ui.pages.BasePage.AlertHeader.SUCCESS;
import static com.provectus.kafka.ui.pages.NaviSideBar.SideMenuOption.TOPICS;
import static com.provectus.kafka.ui.settings.Source.CLUSTER_NAME;
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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class MessageTest extends BaseTest {
  private static final long SUITE_ID = 2;
  private static final String SUITE_TITLE = "Topics";
  private static final Topic TOPIC_FOR_MESSAGES = new Topic()
      .setName("topic-with-clean-message-attribute-" + randomAlphabetic(5))
      .setMessageKey(fileToString(System.getProperty("user.dir") + "/src/test/resources/producedkey.txt"))
      .setMessageContent(fileToString(System.getProperty("user.dir") + "/src/test/resources/testData.txt"));
  private static final List<Topic> TOPIC_LIST = new ArrayList<>();

  @BeforeAll
  public void beforeAll() {
    TOPIC_LIST.addAll(List.of(TOPIC_FOR_MESSAGES));
    TOPIC_LIST.forEach(topic -> apiHelper.createTopic(CLUSTER_NAME, topic.getName()));
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
        .openDetailsTab(TopicDetails.TopicMenu.OVERVIEW)
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
        .openDotMenu()
        .clickClearMessagesMenu()
        .clickConfirmDeleteBtn();
    Assertions.assertTrue(topicDetails.isAlertWithMessageVisible(SUCCESS,TOPIC_FOR_MESSAGES.getName() + " messages have been successfully cleared!"),"isAlertWithMessageVisible()");
//        assertThat(Integer.toString(Integer.valueOf(messageAmount)-1))
//                .withFailMessage("message amount not decrease by one").isEqualTo(topicDetails.MessageCountAmount());
  }

  @AfterAll
  public void afterAll() {
    TOPIC_LIST.forEach(topic -> apiHelper.deleteTopic(CLUSTER_NAME, topic.getName()));
  }
}
