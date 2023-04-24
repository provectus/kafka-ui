package com.provectus.kafka.ui.sanitysuite;

import static com.provectus.kafka.ui.pages.topics.enums.CleanupPolicyValue.COMPACT;
import static com.provectus.kafka.ui.pages.topics.enums.CleanupPolicyValue.DELETE;
import static org.apache.commons.lang3.RandomStringUtils.randomAlphabetic;

import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.models.Topic;
import io.qase.api.annotation.QaseId;
import java.util.ArrayList;
import java.util.List;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.Test;

public class TopicsTest extends BaseTest {

  private static final List<Topic> TOPIC_LIST = new ArrayList<>();

  @QaseId(285)
  @Test()
  public void verifyClearMessagesMenuStateAfterTopicUpdate() {
    Topic topic = new Topic()
        .setName("topic-" + randomAlphabetic(5))
        .setNumberOfPartitions(1)
        .setCleanupPolicyValue(DELETE);
    navigateToTopics();
    topicsList
        .clickAddTopicBtn();
    topicCreateEditForm
        .waitUntilScreenReady()
        .setTopicName(topic.getName())
        .setNumberOfPartitions(topic.getNumberOfPartitions())
        .selectCleanupPolicy(topic.getCleanupPolicyValue())
        .clickSaveTopicBtn();
    topicDetails
        .waitUntilScreenReady();
    TOPIC_LIST.add(topic);
    topicDetails
        .openDotMenu();
    Assert.assertTrue(topicDetails.isClearMessagesMenuEnabled(), "isClearMessagesMenuEnabled");
    topic.setCleanupPolicyValue(COMPACT);
    editCleanUpPolicyAndOpenDotMenu(topic);
    Assert.assertFalse(topicDetails.isClearMessagesMenuEnabled(), "isClearMessagesMenuEnabled");
    topic.setCleanupPolicyValue(DELETE);
    editCleanUpPolicyAndOpenDotMenu(topic);
    Assert.assertTrue(topicDetails.isClearMessagesMenuEnabled(), "isClearMessagesMenuEnabled");
  }

  private void editCleanUpPolicyAndOpenDotMenu(Topic topic) {
    topicDetails
        .clickEditSettingsMenu();
    topicCreateEditForm
        .waitUntilScreenReady()
        .selectCleanupPolicy(topic.getCleanupPolicyValue())
        .clickSaveTopicBtn();
    topicDetails
        .waitUntilScreenReady()
        .openDotMenu();
  }

  @AfterClass(alwaysRun = true)
  public void afterClass() {
    TOPIC_LIST.forEach(topic -> apiService.deleteTopic(topic.getName()));
  }
}
