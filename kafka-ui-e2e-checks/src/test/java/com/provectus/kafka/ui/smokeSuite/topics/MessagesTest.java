package com.provectus.kafka.ui.smokeSuite.topics;

import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.models.Topic;
import com.provectus.kafka.ui.pages.topic.TopicDetails;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.AutomationStatus;
import com.provectus.kafka.ui.utilities.qaseIoUtils.annotations.Suite;
import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;
import io.qameta.allure.Issue;
import io.qase.api.annotation.CaseId;
import io.qase.api.annotation.Step;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Ignore;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.provectus.kafka.ui.pages.BasePage.AlertHeader.SUCCESS;
import static com.provectus.kafka.ui.pages.topic.TopicDetails.TopicMenu.MESSAGES;
import static com.provectus.kafka.ui.pages.topic.TopicDetails.TopicMenu.OVERVIEW;
import static com.provectus.kafka.ui.utilities.TimeUtils.waitUntilNewMinuteStarted;
import static org.apache.commons.lang3.RandomStringUtils.randomAlphabetic;

public class MessagesTest extends BaseTest {

    private static final long SUITE_ID = 2;
    private static final String SUITE_TITLE = "Topics";
    private static final Topic TOPIC_FOR_MESSAGES = new Topic()
            .setName("topic-with-clean-message-attribute-" + randomAlphabetic(5))
            .setMessageKey(randomAlphabetic(5))
            .setMessageContent(randomAlphabetic(10));
    private static final Topic TOPIC_TO_CLEAR_AND_PURGE_MESSAGES = new Topic()
            .setName("topic-to-clear-and-purge-messages-attribute-" + randomAlphabetic(5))
            .setMessageKey(randomAlphabetic(5))
            .setMessageContent(randomAlphabetic(10));
    private static final Topic TOPIC_FOR_CHECKING_FILTERS = new Topic()
            .setName("topic-for-checking-filters-" + randomAlphabetic(5))
            .setMessageKey(randomAlphabetic(5))
            .setMessageContent(randomAlphabetic(10));
    private static final Topic TOPIC_TO_RECREATE = new Topic()
            .setName("topic-to-recreate-attribute-" + randomAlphabetic(5))
            .setMessageKey(randomAlphabetic(5))
            .setMessageContent(randomAlphabetic(10));
    private static final List<Topic> TOPIC_LIST = new ArrayList<>();

    @BeforeClass(alwaysRun = true)
    public void beforeClass() {
        TOPIC_LIST.addAll(List.of(TOPIC_FOR_MESSAGES, TOPIC_FOR_CHECKING_FILTERS, TOPIC_TO_CLEAR_AND_PURGE_MESSAGES,
                TOPIC_TO_RECREATE));
        TOPIC_LIST.forEach(topic -> apiService.createTopic(topic.getName()));
        IntStream.range(1, 3).forEach(i -> apiService.sendMessage(TOPIC_FOR_CHECKING_FILTERS));
        waitUntilNewMinuteStarted();
        IntStream.range(1, 3).forEach(i -> apiService.sendMessage(TOPIC_FOR_CHECKING_FILTERS));
    }

    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(222)
    @Test(priority = 1)
    public void produceMessage() {
        navigateToTopicsAndOpenDetails(TOPIC_FOR_MESSAGES.getName());
        topicDetails
                .openDetailsTab(MESSAGES);
        produceMessage(TOPIC_FOR_MESSAGES);
        SoftAssert softly = new SoftAssert();
        softly.assertTrue(topicDetails.isKeyMessageVisible((TOPIC_FOR_MESSAGES.getMessageKey())),
                "isKeyMessageVisible()");
        softly.assertTrue(topicDetails.isContentMessageVisible((TOPIC_FOR_MESSAGES.getMessageContent()).trim()),
                "isContentMessageVisible()");
        softly.assertAll();
    }

    @Ignore
    @Issue("https://github.com/provectus/kafka-ui/issues/2778")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(19)
    @Test(priority = 2)
    public void clearMessage() {
        navigateToTopicsAndOpenDetails(TOPIC_FOR_MESSAGES.getName());
        topicDetails
                .openDetailsTab(OVERVIEW);
        int messageAmount = topicDetails.getMessageCountAmount();
        produceMessage(TOPIC_FOR_MESSAGES);
        Assert.assertEquals(messageAmount + 1, topicDetails.getMessageCountAmount(), "getMessageCountAmount()");
        topicDetails
                .openDotMenu()
                .clickClearMessagesMenu()
                .waitUntilScreenReady();
        Assert.assertEquals(0, topicDetails.getMessageCountAmount(), "getMessageCountAmount()");
    }

    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(239)
    @Test(priority = 3)
    public void checkClearTopicMessage() {
        navigateToTopicsAndOpenDetails(TOPIC_TO_CLEAR_AND_PURGE_MESSAGES.getName());
        topicDetails
                .openDetailsTab(OVERVIEW);
        produceMessage(TOPIC_TO_CLEAR_AND_PURGE_MESSAGES);
        navigateToTopics();
        Assert.assertEquals(topicsList.getTopicItem(TOPIC_TO_CLEAR_AND_PURGE_MESSAGES.getName()).getNumberOfMessages(), 1,
                "getNumberOfMessages()");
        topicsList
                .openDotMenuByTopicName(TOPIC_TO_CLEAR_AND_PURGE_MESSAGES.getName())
                .clickClearMessagesBtn()
                .clickConfirmBtnMdl();
        SoftAssert softly = new SoftAssert();
        softly.assertTrue(topicsList.isAlertWithMessageVisible(SUCCESS,
                        String.format("%s messages have been successfully cleared!", TOPIC_TO_CLEAR_AND_PURGE_MESSAGES.getName())),
                "isAlertWithMessageVisible()");
        softly.assertEquals(topicsList.getTopicItem(TOPIC_TO_CLEAR_AND_PURGE_MESSAGES.getName()).getNumberOfMessages(), 0,
                "getNumberOfMessages()");
        softly.assertAll();
    }

    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(10)
    @Test(priority = 4)
    public void checkPurgeMessagePossibility() {
        navigateToTopics();
        int messageAmount = topicsList.getTopicItem(TOPIC_TO_CLEAR_AND_PURGE_MESSAGES.getName()).getNumberOfMessages();
        topicsList
                .openTopic(TOPIC_TO_CLEAR_AND_PURGE_MESSAGES.getName());
        topicDetails
                .openDetailsTab(OVERVIEW);
        produceMessage(TOPIC_TO_CLEAR_AND_PURGE_MESSAGES);
        navigateToTopics();
        Assert.assertEquals(topicsList.getTopicItem(TOPIC_TO_CLEAR_AND_PURGE_MESSAGES.getName()).getNumberOfMessages(),
                messageAmount + 1, "getNumberOfMessages()");
        topicsList
                .getTopicItem(TOPIC_TO_CLEAR_AND_PURGE_MESSAGES.getName())
                .selectItem(true)
                .clickPurgeMessagesOfSelectedTopicsBtn();
        Assert.assertTrue(topicsList.isConfirmationMdlVisible(), "isConfirmationMdlVisible()");
        topicsList
                .clickCancelBtnMdl()
                .clickPurgeMessagesOfSelectedTopicsBtn()
                .clickConfirmBtnMdl();
        SoftAssert softly = new SoftAssert();
        softly.assertTrue(topicsList.isAlertWithMessageVisible(SUCCESS,
                        String.format("%s messages have been successfully cleared!", TOPIC_TO_CLEAR_AND_PURGE_MESSAGES.getName())),
                "isAlertWithMessageVisible()");
        softly.assertEquals(topicsList.getTopicItem(TOPIC_TO_CLEAR_AND_PURGE_MESSAGES.getName()).getNumberOfMessages(), 0,
                "getNumberOfMessages()");
        softly.assertAll();
    }

    @Ignore
    @Issue("https://github.com/provectus/kafka-ui/issues/2819")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(21)
    @Test(priority = 5)
    public void copyMessageFromTopicProfile() {
        navigateToTopicsAndOpenDetails(TOPIC_FOR_CHECKING_FILTERS.getName());
        topicDetails
                .openDetailsTab(MESSAGES)
                .getRandomMessage()
                .openDotMenu()
                .clickCopyToClipBoard();
        Assert.assertTrue(topicDetails.isAlertWithMessageVisible(SUCCESS, "Copied successfully!"),
                "isAlertWithMessageVisible()");
    }

    @Ignore
    @Issue("https://github.com/provectus/kafka-ui/issues/2394")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(15)
    @Test(priority = 6)
    public void checkingMessageFilteringByOffset() {
        navigateToTopicsAndOpenDetails(TOPIC_FOR_CHECKING_FILTERS.getName());
        topicDetails
                .openDetailsTab(MESSAGES);
        TopicDetails.MessageGridItem secondMessage = topicDetails.getMessageByOffset(1);
        topicDetails
                .selectSeekTypeDdlMessagesTab("Offset")
                .setSeekTypeValueFldMessagesTab(String.valueOf(secondMessage.getOffset()))
                .clickSubmitFiltersBtnMessagesTab();
        SoftAssert softly = new SoftAssert();
        topicDetails.getAllMessages().forEach(message ->
                softly.assertTrue(message.getOffset() == secondMessage.getOffset()
                                || message.getOffset() > secondMessage.getOffset(),
                        String.format("Expected offset is: %s, but found: %s", secondMessage.getOffset(), message.getOffset())));
        softly.assertAll();
    }

    @Ignore
    @Issue("https://github.com/provectus/kafka-ui/issues/3215")
    @Issue("https://github.com/provectus/kafka-ui/issues/2345")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(16)
    @Test(priority = 7)
    public void checkingMessageFilteringByTimestamp() {
        navigateToTopicsAndOpenDetails(TOPIC_FOR_CHECKING_FILTERS.getName());
        topicDetails
                .openDetailsTab(MESSAGES);
        LocalDateTime firstTimestamp = topicDetails.getMessageByOffset(0).getTimestamp();
        List<TopicDetails.MessageGridItem> nextMessages = topicDetails.getAllMessages().stream()
                .filter(message -> message.getTimestamp().getMinute() != firstTimestamp.getMinute())
                .toList();
        LocalDateTime nextTimestamp = Objects.requireNonNull(nextMessages.stream()
                .findFirst().orElseThrow()).getTimestamp();
        topicDetails
                .selectSeekTypeDdlMessagesTab("Timestamp")
                .openCalendarSeekType()
                .selectDateAndTimeByCalendar(nextTimestamp)
                .clickSubmitFiltersBtnMessagesTab();
        SoftAssert softly = new SoftAssert();
        topicDetails.getAllMessages().forEach(message ->
                softly.assertTrue(message.getTimestamp().isEqual(nextTimestamp)
                                || message.getTimestamp().isAfter(nextTimestamp),
                        String.format("Expected timestamp is: %s, but found: %s", nextTimestamp, message.getTimestamp())));
        softly.assertAll();
    }

    @Ignore
    @Issue("https://github.com/provectus/kafka-ui/issues/2778")
    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(246)
    @Test(priority = 8)
    public void checkClearTopicMessageFromOverviewTab() {
        navigateToTopicsAndOpenDetails(TOPIC_FOR_CHECKING_FILTERS.getName());
        topicDetails
                .openDetailsTab(OVERVIEW)
                .openDotMenu()
                .clickClearMessagesMenu()
                .clickConfirmBtnMdl();
        SoftAssert softly = new SoftAssert();
        softly.assertTrue(topicDetails.isAlertWithMessageVisible(SUCCESS,
                        String.format("%s messages have been successfully cleared!", TOPIC_FOR_CHECKING_FILTERS.getName())),
                "isAlertWithMessageVisible()");
        softly.assertEquals(topicDetails.getMessageCountAmount(), 0,
                "getMessageCountAmount()= " + topicDetails.getMessageCountAmount());
        softly.assertAll();
    }

    @Suite(suiteId = SUITE_ID, title = SUITE_TITLE)
    @AutomationStatus(status = Status.AUTOMATED)
    @CaseId(240)
    @Test(priority = 9)
    public void checkRecreateTopic() {
        navigateToTopicsAndOpenDetails(TOPIC_TO_RECREATE.getName());
        topicDetails
                .openDetailsTab(OVERVIEW);
        produceMessage(TOPIC_TO_RECREATE);
        navigateToTopics();
        Assert.assertEquals(topicsList.getTopicItem(TOPIC_TO_RECREATE.getName()).getNumberOfMessages(), 1,
                "getNumberOfMessages()");
        topicsList
                .openDotMenuByTopicName(TOPIC_TO_RECREATE.getName())
                .clickRecreateTopicBtn()
                .clickConfirmBtnMdl();
        SoftAssert softly = new SoftAssert();
        softly.assertTrue(topicDetails.isAlertWithMessageVisible(SUCCESS,
                        String.format("Topic %s successfully recreated!", TOPIC_TO_RECREATE.getName())),
                "isAlertWithMessageVisible()");
        softly.assertEquals(topicsList.getTopicItem(TOPIC_TO_RECREATE.getName()).getNumberOfMessages(), 0,
                "getNumberOfMessages()");
        softly.assertAll();
    }

    @Step
    protected void produceMessage(Topic topic) {
        topicDetails
                .clickProduceMessageBtn();
        produceMessagePanel
                .waitUntilScreenReady()
                .setKeyField(topic.getMessageKey())
                .setContentFiled(topic.getMessageContent())
                .submitProduceMessage();
        topicDetails
                .waitUntilScreenReady();
    }

    @AfterClass(alwaysRun = true)
    public void afterClass() {
        TOPIC_LIST.forEach(topic -> apiService.deleteTopic(topic.getName()));
    }
}
