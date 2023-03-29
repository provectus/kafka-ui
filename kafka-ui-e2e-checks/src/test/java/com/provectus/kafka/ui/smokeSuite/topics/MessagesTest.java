package com.provectus.kafka.ui.smokeSuite.topics;

import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.models.Topic;
import com.provectus.kafka.ui.pages.topics.TopicDetails;
import io.qameta.allure.Issue;
import io.qameta.allure.Step;
import io.qase.api.annotation.QaseId;
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
import java.util.stream.IntStream;

import static com.provectus.kafka.ui.pages.BasePage.AlertHeader.SUCCESS;
import static com.provectus.kafka.ui.pages.topics.TopicDetails.TopicMenu.MESSAGES;
import static com.provectus.kafka.ui.pages.topics.TopicDetails.TopicMenu.OVERVIEW;
import static com.provectus.kafka.ui.utilities.TimeUtils.waitUntilNewMinuteStarted;
import static org.apache.commons.lang3.RandomStringUtils.randomAlphabetic;

public class MessagesTest extends BaseTest {

    private static final Topic TOPIC_FOR_MESSAGES = new Topic()
            .setName("topic-with-clean-message-attribute-" + randomAlphabetic(5))
            .setMessageKey(randomAlphabetic(5))
            .setMessageContent(randomAlphabetic(10));
    private static final Topic TOPIC_TO_CLEAR_AND_PURGE_MESSAGES = new Topic()
            .setName("topic-to-clear-and-purge-messages-" + randomAlphabetic(5))
            .setMessageKey(randomAlphabetic(5))
            .setMessageContent(randomAlphabetic(10));
    private static final Topic TOPIC_FOR_CHECK_FILTERS = new Topic()
            .setName("topic-for-check-filters-" + randomAlphabetic(5))
            .setMessageKey(randomAlphabetic(5))
            .setMessageContent(randomAlphabetic(10));
    private static final Topic TOPIC_TO_RECREATE = new Topic()
            .setName("topic-to-recreate-attribute-" + randomAlphabetic(5))
            .setMessageKey(randomAlphabetic(5))
            .setMessageContent(randomAlphabetic(10));
    private static final Topic TOPIC_FOR_CHECK_MESSAGES_COUNT = new Topic()
            .setName("topic-for-check-messages-count" + randomAlphabetic(5))
            .setMessageKey(randomAlphabetic(5))
            .setMessageContent(randomAlphabetic(10));
    private static final List<Topic> TOPIC_LIST = new ArrayList<>();

    @BeforeClass(alwaysRun = true)
    public void beforeClass() {
        TOPIC_LIST.addAll(List.of(TOPIC_FOR_MESSAGES, TOPIC_FOR_CHECK_FILTERS, TOPIC_TO_CLEAR_AND_PURGE_MESSAGES,
                TOPIC_TO_RECREATE, TOPIC_FOR_CHECK_MESSAGES_COUNT));
        TOPIC_LIST.forEach(topic -> apiService.createTopic(topic));
        IntStream.range(1, 3).forEach(i -> apiService.sendMessage(TOPIC_FOR_CHECK_FILTERS));
        waitUntilNewMinuteStarted();
        IntStream.range(1, 3).forEach(i -> apiService.sendMessage(TOPIC_FOR_CHECK_FILTERS));
        IntStream.range(1, 110).forEach(i -> apiService.sendMessage(TOPIC_FOR_CHECK_MESSAGES_COUNT));
    }

    @QaseId(222)
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

    @QaseId(19)
    @Test(priority = 2)
    public void clearMessage() {
        navigateToTopicsAndOpenDetails(TOPIC_FOR_MESSAGES.getName());
        topicDetails
                .openDetailsTab(OVERVIEW);
        int messageAmount = topicDetails.getMessageCountAmount();
        produceMessage(TOPIC_FOR_MESSAGES);
        Assert.assertEquals(topicDetails.getMessageCountAmount(), messageAmount + 1, "getMessageCountAmount()");
        topicDetails
                .openDotMenu()
                .clickClearMessagesMenu()
                .clickConfirmBtnMdl()
                .waitUntilScreenReady();
        Assert.assertEquals(topicDetails.getMessageCountAmount(), 0, "getMessageCountAmount()");
    }

    @QaseId(239)
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

    @QaseId(10)
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
    @Issue("https://github.com/provectus/kafka-ui/issues/2394")
    @QaseId(15)
    @Test(priority = 6)
    public void checkMessageFilteringByOffset() {
        navigateToTopicsAndOpenDetails(TOPIC_FOR_CHECK_FILTERS.getName());
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
    @QaseId(16)
    @Test(priority = 7)
    public void checkMessageFilteringByTimestamp() {
        navigateToTopicsAndOpenDetails(TOPIC_FOR_CHECK_FILTERS.getName());
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
    @QaseId(246)
    @Test(priority = 8)
    public void checkClearTopicMessageFromOverviewTab() {
        navigateToTopicsAndOpenDetails(TOPIC_FOR_CHECK_FILTERS.getName());
        topicDetails
                .openDetailsTab(OVERVIEW)
                .openDotMenu()
                .clickClearMessagesMenu()
                .clickConfirmBtnMdl();
        SoftAssert softly = new SoftAssert();
        softly.assertTrue(topicDetails.isAlertWithMessageVisible(SUCCESS,
                        String.format("%s messages have been successfully cleared!", TOPIC_FOR_CHECK_FILTERS.getName())),
                "isAlertWithMessageVisible()");
        softly.assertEquals(topicDetails.getMessageCountAmount(), 0,
                "getMessageCountAmount()= " + topicDetails.getMessageCountAmount());
        softly.assertAll();
    }

    @QaseId(240)
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

    @Ignore
    @Issue("https://github.com/provectus/kafka-ui/issues/3129")
    @QaseId(267)
    @Test(priority = 10)
    public void CheckMessagesCountPerPageWithinTopic() {
        navigateToTopicsAndOpenDetails(TOPIC_FOR_CHECK_MESSAGES_COUNT.getName());
        topicDetails
                .openDetailsTab(MESSAGES);
        int messagesPerPage = topicDetails.getAllMessages().size();
        SoftAssert softly = new SoftAssert();
        softly.assertEquals(messagesPerPage, 100, "getAllMessages()");
        softly.assertFalse(topicDetails.isBackButtonEnabled(), "isBackButtonEnabled()");
        softly.assertTrue(topicDetails.isNextButtonEnabled(), "isNextButtonEnabled()");
        softly.assertAll();
        int lastOffsetOnPage = topicDetails.getAllMessages()
                .get(messagesPerPage - 1).getOffset();
        topicDetails
                .clickNextButton();
        softly.assertEquals(topicDetails.getAllMessages().stream().findFirst().orElseThrow().getOffset(),
                lastOffsetOnPage + 1, "findFirst().getOffset()");
        softly.assertTrue(topicDetails.isBackButtonEnabled(), "isBackButtonEnabled()");
        softly.assertFalse(topicDetails.isNextButtonEnabled(), "isNextButtonEnabled()");
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
