package com.provectus.kafka.ui.steps.kafka;

import com.provectus.kafka.ui.pages.Pages;
import com.provectus.kafka.ui.pages.topic.TopicView;
import com.provectus.kafka.ui.pages.topic.TopicsList;
import io.qameta.allure.Step;
import lombok.SneakyThrows;

import static org.apache.kafka.common.utils.Utils.readFileAsString;

public class TopicSteps extends Pages {
    private static final TopicSteps INSTANSE = new TopicSteps();

    @Step("Create new topic")
    public static TopicSteps createNewTopic(String topicName) {
        new TopicsList().pressCreateNewTopic()
                .setTopicName(topicName)
                .sendData();
        return INSTANSE;
    }

    @Step("Open topic list")
    public static TopicSteps openTopicList(String topicName) {
        new TopicsList().openTopic(topicName);
        return INSTANSE;
    }

    @Step("Update topic")
    public static TopicSteps updateTopic(String topicName, String policyValue, String timeToRetainValue, String maxSizeOnDisk, String MaxMessageBytes) {
        new TopicsList().openTopic(topicName)
                .isOnTopicViewPage()
                .openEditSettings()
                .selectCleanupPolicy(policyValue)
                .setMinInsyncReplicas(10)
                .setTimeToRetainDataInMs(timeToRetainValue)
                .setMaxSizeOnDiskInGB(maxSizeOnDisk)
                .setMaxMessageBytes(MaxMessageBytes)
                .sendData()
                .isOnTopicViewPage();
        return INSTANSE;
    }

    @SneakyThrows
    @Step("Produce message")
    public static TopicSteps produceMessage(String topicName, String contentMessage, String keyMessage) {
        new TopicsList().openTopic(topicName)
                .openTopicMenu(TopicView.TopicMenu.MESSAGES)
                .clickOnButton("Produce Message")
                .setContentFiled(readFileAsString(contentMessage))
                .setKeyField(readFileAsString(keyMessage))
                .submitProduceMessage();
        return INSTANSE;
    }


    @Step("Delete topic")
    public static TopicSteps deleteTopic(String topicName) {
        new TopicsList().openTopic(topicName)
                .isOnTopicViewPage()
                .deleteTopic();
        return INSTANSE;
    }


    @Step("Is on topic view page")
    public TopicView isOnTopicViewPage() {
        return INSTANSE.topicView.isOnTopicViewPage();

    }

    @Step("Is on page")
    public TopicsList isOnPage() {
        return topicsList.isOnPage();
    }

    @Step("Is key message visible")
    public static boolean isKeyMessageVisible(String messageText) {
        return new TopicView().isKeyMessageVisible(messageText);
    }

    @Step("Is content message visible")
    public static boolean isContentMessageVisible(String contentText) {
        return new TopicView().isContentMessageVisible(contentText);
    }


    @Step("Is topic not visible")
    public static boolean isTopicNotVisible(String topicName) {
        return new TopicsList().isTopicNotVisible(topicName);

    }


    @Step("Is topic visible in the list")
    public static boolean IsTopicVisible(String topicName) {
        return new TopicsList().isTopicVisible(topicName);
    }


}






