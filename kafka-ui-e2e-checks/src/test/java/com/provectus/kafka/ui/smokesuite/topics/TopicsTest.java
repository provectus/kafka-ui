package com.provectus.kafka.ui.smokesuite.topics;

import static com.provectus.kafka.ui.pages.BasePage.AlertHeader.SUCCESS;
import static com.provectus.kafka.ui.pages.topics.TopicDetails.TopicMenu.CONSUMERS;
import static com.provectus.kafka.ui.pages.topics.TopicDetails.TopicMenu.MESSAGES;
import static com.provectus.kafka.ui.pages.topics.TopicDetails.TopicMenu.SETTINGS;
import static com.provectus.kafka.ui.pages.topics.enums.CleanupPolicyValue.COMPACT;
import static com.provectus.kafka.ui.pages.topics.enums.CleanupPolicyValue.DELETE;
import static com.provectus.kafka.ui.pages.topics.enums.CustomParameterType.COMPRESSION_TYPE;
import static com.provectus.kafka.ui.pages.topics.enums.MaxSizeOnDisk.NOT_SET;
import static com.provectus.kafka.ui.pages.topics.enums.MaxSizeOnDisk.SIZE_1_GB;
import static com.provectus.kafka.ui.pages.topics.enums.MaxSizeOnDisk.SIZE_50_GB;
import static com.provectus.kafka.ui.pages.topics.enums.TimeToRetain.BTN_2_DAYS;
import static com.provectus.kafka.ui.pages.topics.enums.TimeToRetain.BTN_7_DAYS;
import static org.apache.commons.lang3.RandomStringUtils.randomAlphabetic;
import static org.apache.commons.lang3.RandomUtils.nextInt;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.models.Topic;
import io.qameta.allure.Issue;
import io.qase.api.annotation.QaseId;
import java.util.ArrayList;
import java.util.List;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Ignore;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

public class TopicsTest extends BaseTest {

  private static final Topic TOPIC_TO_CREATE = new Topic()
      .setName("new-topic-" + randomAlphabetic(5))
      .setNumberOfPartitions(1)
      .setCustomParameterType(COMPRESSION_TYPE)
      .setCustomParameterValue("producer")
      .setCleanupPolicyValue(DELETE);
  private static final Topic TOPIC_TO_UPDATE_AND_DELETE = new Topic()
      .setName("topic-to-update-and-delete-" + randomAlphabetic(5))
      .setNumberOfPartitions(1)
      .setCleanupPolicyValue(DELETE)
      .setTimeToRetain(BTN_7_DAYS)
      .setMaxSizeOnDisk(NOT_SET)
      .setMaxMessageBytes("1048588")
      .setMessageKey(randomAlphabetic(5))
      .setMessageValue(randomAlphabetic(10));
  private static final Topic TOPIC_TO_CHECK_SETTINGS = new Topic()
      .setName("new-topic-" + randomAlphabetic(5))
      .setNumberOfPartitions(1)
      .setMaxMessageBytes("1000012")
      .setMaxSizeOnDisk(NOT_SET);
  private static final Topic TOPIC_FOR_CHECK_FILTERS = new Topic()
      .setName("topic-for-check-filters-" + randomAlphabetic(5));
  private static final Topic TOPIC_FOR_DELETE = new Topic()
      .setName("topic-to-delete-" + randomAlphabetic(5));
  private static final List<Topic> TOPIC_LIST = new ArrayList<>();

  @BeforeClass(alwaysRun = true)
  public void beforeClass() {
    TOPIC_LIST.addAll(List.of(TOPIC_TO_UPDATE_AND_DELETE, TOPIC_FOR_DELETE, TOPIC_FOR_CHECK_FILTERS));
    TOPIC_LIST.forEach(topic -> apiService.createTopic(topic));
  }

  @QaseId(199)
  @Test(priority = 1)
  public void createTopic() {
    navigateToTopics();
    topicsList
        .clickAddTopicBtn();
    topicCreateEditForm
        .waitUntilScreenReady()
        .setTopicName(TOPIC_TO_CREATE.getName())
        .setNumberOfPartitions(TOPIC_TO_CREATE.getNumberOfPartitions())
        .selectCleanupPolicy(TOPIC_TO_CREATE.getCleanupPolicyValue())
        .clickSaveTopicBtn();
    navigateToTopicsAndOpenDetails(TOPIC_TO_CREATE.getName());
    SoftAssert softly = new SoftAssert();
    softly.assertTrue(topicDetails.isTopicHeaderVisible(TOPIC_TO_CREATE.getName()), "isTopicHeaderVisible()");
    softly.assertEquals(topicDetails.getCleanUpPolicy(), TOPIC_TO_CREATE.getCleanupPolicyValue().toString(),
        "getCleanUpPolicy()");
    softly.assertEquals(topicDetails.getPartitions(), TOPIC_TO_CREATE.getNumberOfPartitions(), "getPartitions()");
    softly.assertAll();
    navigateToTopics();
    Assert.assertTrue(topicsList.isTopicVisible(TOPIC_TO_CREATE.getName()), "isTopicVisible()");
    TOPIC_LIST.add(TOPIC_TO_CREATE);
  }

  @QaseId(7)
  @Test(priority = 2)
  void checkAvailableOperations() {
    navigateToTopics();
    topicsList
        .getTopicItem(TOPIC_TO_UPDATE_AND_DELETE.getName())
        .selectItem(true);
    verifyElementsCondition(topicsList.getActionButtons(), Condition.enabled);
    topicsList
        .getTopicItem(TOPIC_FOR_CHECK_FILTERS.getName())
        .selectItem(true);
    Assert.assertFalse(topicsList.isCopySelectedTopicBtnEnabled(), "isCopySelectedTopicBtnEnabled()");
  }

  @Ignore
  @Issue("https://github.com/provectus/kafka-ui/issues/3071")
  @QaseId(268)
  @Test(priority = 3)
  public void checkCustomParametersWithinEditExistingTopic() {
    navigateToTopicsAndOpenDetails(TOPIC_TO_UPDATE_AND_DELETE.getName());
    topicDetails
        .openDotMenu()
        .clickEditSettingsMenu();
    SoftAssert softly = new SoftAssert();
    topicCreateEditForm
        .waitUntilScreenReady()
        .clickAddCustomParameterTypeButton()
        .openCustomParameterTypeDdl()
        .getAllDdlOptions()
        .forEach(option ->
            softly.assertTrue(!option.is(Condition.attribute("disabled")),
                option.getText() + " is enabled:"));
    softly.assertAll();
  }

  @QaseId(197)
  @Test(priority = 4)
  public void updateTopic() {
    navigateToTopicsAndOpenDetails(TOPIC_TO_UPDATE_AND_DELETE.getName());
    topicDetails
        .openDotMenu()
        .clickEditSettingsMenu();
    topicCreateEditForm
        .waitUntilScreenReady();
    SoftAssert softly = new SoftAssert();
    softly.assertEquals(topicCreateEditForm.getCleanupPolicy(),
        TOPIC_TO_UPDATE_AND_DELETE.getCleanupPolicyValue().getVisibleText(), "getCleanupPolicy()");
    softly.assertEquals(topicCreateEditForm.getTimeToRetain(),
        TOPIC_TO_UPDATE_AND_DELETE.getTimeToRetain().getValue(), "getTimeToRetain()");
    softly.assertEquals(topicCreateEditForm.getMaxSizeOnDisk(),
        TOPIC_TO_UPDATE_AND_DELETE.getMaxSizeOnDisk().getVisibleText(), "getMaxSizeOnDisk()");
    softly.assertEquals(topicCreateEditForm.getMaxMessageBytes(),
        TOPIC_TO_UPDATE_AND_DELETE.getMaxMessageBytes(), "getMaxMessageBytes()");
    softly.assertAll();
    TOPIC_TO_UPDATE_AND_DELETE
        .setCleanupPolicyValue(COMPACT)
        .setTimeToRetain(BTN_2_DAYS)
        .setMaxSizeOnDisk(SIZE_50_GB).setMaxMessageBytes("1048589");
    topicCreateEditForm
        .selectCleanupPolicy((TOPIC_TO_UPDATE_AND_DELETE.getCleanupPolicyValue()))
        .setTimeToRetainDataByButtons(TOPIC_TO_UPDATE_AND_DELETE.getTimeToRetain())
        .setMaxSizeOnDiskInGB(TOPIC_TO_UPDATE_AND_DELETE.getMaxSizeOnDisk())
        .setMaxMessageBytes(TOPIC_TO_UPDATE_AND_DELETE.getMaxMessageBytes())
        .clickSaveTopicBtn();
    softly.assertTrue(topicDetails.isAlertWithMessageVisible(SUCCESS, "Topic successfully updated."),
        "isAlertWithMessageVisible()");
    softly.assertTrue(topicDetails.isTopicHeaderVisible(TOPIC_TO_UPDATE_AND_DELETE.getName()),
        "isTopicHeaderVisible()");
    softly.assertAll();
    topicDetails
        .waitUntilScreenReady();
    navigateToTopicsAndOpenDetails(TOPIC_TO_UPDATE_AND_DELETE.getName());
    topicDetails
        .openDotMenu()
        .clickEditSettingsMenu();
    softly.assertFalse(topicCreateEditForm.isNameFieldEnabled(), "isNameFieldEnabled()");
    softly.assertEquals(topicCreateEditForm.getCleanupPolicy(),
        TOPIC_TO_UPDATE_AND_DELETE.getCleanupPolicyValue().getVisibleText(), "getCleanupPolicy()");
    softly.assertEquals(topicCreateEditForm.getTimeToRetain(),
        TOPIC_TO_UPDATE_AND_DELETE.getTimeToRetain().getValue(), "getTimeToRetain()");
    softly.assertEquals(topicCreateEditForm.getMaxSizeOnDisk(),
        TOPIC_TO_UPDATE_AND_DELETE.getMaxSizeOnDisk().getVisibleText(), "getMaxSizeOnDisk()");
    softly.assertEquals(topicCreateEditForm.getMaxMessageBytes(),
        TOPIC_TO_UPDATE_AND_DELETE.getMaxMessageBytes(), "getMaxMessageBytes()");
    softly.assertAll();
  }

  @QaseId(242)
  @Test(priority = 5)
  public void removeTopicFromTopicList() {
    navigateToTopics();
    topicsList
        .openDotMenuByTopicName(TOPIC_TO_UPDATE_AND_DELETE.getName())
        .clickRemoveTopicBtn()
        .clickConfirmBtnMdl();
    Assert.assertTrue(topicsList.isAlertWithMessageVisible(SUCCESS,
            String.format("Topic %s successfully deleted!", TOPIC_TO_UPDATE_AND_DELETE.getName())),
        "isAlertWithMessageVisible()");
    TOPIC_LIST.remove(TOPIC_TO_UPDATE_AND_DELETE);
  }

  @QaseId(207)
  @Test(priority = 6)
  public void deleteTopic() {
    navigateToTopicsAndOpenDetails(TOPIC_FOR_DELETE.getName());
    topicDetails
        .openDotMenu()
        .clickDeleteTopicMenu()
        .clickConfirmBtnMdl();
    navigateToTopics();
    Assert.assertFalse(topicsList.isTopicVisible(TOPIC_FOR_DELETE.getName()), "isTopicVisible");
    TOPIC_LIST.remove(TOPIC_FOR_DELETE);
  }

  @QaseId(20)
  @Test(priority = 7)
  public void redirectToConsumerFromTopic() {
    String topicName = "source-activities";
    String consumerGroupId = "connect-sink_postgres_activities";
    navigateToTopicsAndOpenDetails(topicName);
    topicDetails
        .openDetailsTab(CONSUMERS)
        .openConsumerGroup(consumerGroupId);
    consumersDetails
        .waitUntilScreenReady();
    SoftAssert softly = new SoftAssert();
    softly.assertTrue(consumersDetails.isRedirectedConsumerTitleVisible(consumerGroupId),
        "isRedirectedConsumerTitleVisible()");
    softly.assertTrue(consumersDetails.isTopicInConsumersDetailsVisible(topicName),
        "isTopicInConsumersDetailsVisible()");
    softly.assertAll();
  }

  @QaseId(4)
  @Test(priority = 8)
  public void checkTopicCreatePossibility() {
    navigateToTopics();
    topicsList
        .clickAddTopicBtn();
    topicCreateEditForm
        .waitUntilScreenReady();
    Assert.assertFalse(topicCreateEditForm.isCreateTopicButtonEnabled(), "isCreateTopicButtonEnabled()");
    topicCreateEditForm
        .setTopicName("testName");
    Assert.assertFalse(topicCreateEditForm.isCreateTopicButtonEnabled(), "isCreateTopicButtonEnabled()");
    topicCreateEditForm
        .setTopicName(null)
        .setNumberOfPartitions(nextInt(1, 10));
    Assert.assertFalse(topicCreateEditForm.isCreateTopicButtonEnabled(), "isCreateTopicButtonEnabled()");
    topicCreateEditForm
        .setTopicName("testName");
    Assert.assertTrue(topicCreateEditForm.isCreateTopicButtonEnabled(), "isCreateTopicButtonEnabled()");
  }

  @QaseId(266)
  @Test(priority = 9)
  public void checkTimeToRetainDataCustomValueWithEditingTopic() {
    Topic topicToRetainData = new Topic()
        .setName("topic-to-retain-data-" + randomAlphabetic(5))
        .setTimeToRetainData("86400000");
    navigateToTopics();
    topicsList
        .clickAddTopicBtn();
    topicCreateEditForm
        .waitUntilScreenReady()
        .setTopicName(topicToRetainData.getName())
        .setNumberOfPartitions(1)
        .setTimeToRetainDataInMs("604800000");
    Assert.assertEquals(topicCreateEditForm.getTimeToRetain(), "604800000", "getTimeToRetain()");
    topicCreateEditForm
        .setTimeToRetainDataInMs(topicToRetainData.getTimeToRetainData())
        .clickSaveTopicBtn();
    topicDetails
        .waitUntilScreenReady()
        .openDotMenu()
        .clickEditSettingsMenu();
    Assert.assertEquals(topicCreateEditForm.getTimeToRetain(), topicToRetainData.getTimeToRetainData(),
        "getTimeToRetain()");
    topicDetails
        .openDetailsTab(SETTINGS);
    Assert.assertEquals(topicDetails.getSettingsGridValueByKey("retention.ms"), topicToRetainData.getTimeToRetainData(),
        "getSettingsGridValueByKey()");
    TOPIC_LIST.add(topicToRetainData);
  }

  @QaseId(6)
  @Test(priority = 10)
  public void checkCustomParametersWithinCreateNewTopic() {
    navigateToTopics();
    topicsList
        .clickAddTopicBtn();
    topicCreateEditForm
        .waitUntilScreenReady()
        .setTopicName(TOPIC_TO_CREATE.getName())
        .clickAddCustomParameterTypeButton()
        .setCustomParameterType(TOPIC_TO_CREATE.getCustomParameterType());
    Assert.assertTrue(topicCreateEditForm.isDeleteCustomParameterButtonEnabled(),
        "isDeleteCustomParameterButtonEnabled()");
    topicCreateEditForm
        .clearCustomParameterValue();
    Assert.assertTrue(topicCreateEditForm.isValidationMessageCustomParameterValueVisible(),
        "isValidationMessageCustomParameterValueVisible()");
  }

  @QaseId(2)
  @Test(priority = 11)
  public void checkTopicListElements() {
    navigateToTopics();
    verifyElementsCondition(topicsList.getAllVisibleElements(), Condition.visible);
    verifyElementsCondition(topicsList.getAllEnabledElements(), Condition.enabled);
  }

  @QaseId(12)
  @Test(priority = 12)
  public void addNewFilterWithinTopic() {
    String filterName = randomAlphabetic(5);
    navigateToTopicsAndOpenDetails(TOPIC_FOR_CHECK_FILTERS.getName());
    topicDetails
        .openDetailsTab(MESSAGES)
        .clickMessagesAddFiltersBtn()
        .waitUntilAddFiltersMdlVisible();
    verifyElementsCondition(topicDetails.getAllAddFilterModalVisibleElements(), Condition.visible);
    verifyElementsCondition(topicDetails.getAllAddFilterModalEnabledElements(), Condition.enabled);
    verifyElementsCondition(topicDetails.getAllAddFilterModalDisabledElements(), Condition.disabled);
    Assert.assertFalse(topicDetails.isSaveThisFilterCheckBoxSelected(), "isSaveThisFilterCheckBoxSelected()");
    topicDetails
        .setFilterCodeFldAddFilterMdl(filterName);
    Assert.assertTrue(topicDetails.isAddFilterBtnAddFilterMdlEnabled(), "isAddFilterBtnAddFilterMdlEnabled()");
    topicDetails.clickAddFilterBtnAndCloseMdl(true);
    Assert.assertTrue(topicDetails.isActiveFilterVisible(filterName), "isActiveFilterVisible()");
  }

  @QaseId(352)
  @Test(priority = 13)
  public void editActiveSmartFilterCheck() {
    String filterName = randomAlphabetic(5);
    String filterCode = randomAlphabetic(5);
    navigateToTopicsAndOpenDetails(TOPIC_FOR_CHECK_FILTERS.getName());
    topicDetails
        .openDetailsTab(MESSAGES)
        .clickMessagesAddFiltersBtn()
        .waitUntilAddFiltersMdlVisible()
        .setFilterCodeFldAddFilterMdl(filterCode)
        .setDisplayNameFldAddFilterMdl(filterName)
        .clickAddFilterBtnAndCloseMdl(true)
        .clickEditActiveFilterBtn(filterName)
        .waitUntilAddFiltersMdlVisible();
    SoftAssert softly = new SoftAssert();
    softly.assertEquals(topicDetails.getFilterCodeValue(), filterCode, "getFilterCodeValue()");
    softly.assertEquals(topicDetails.getFilterNameValue(), filterName, "getFilterNameValue()");
    softly.assertAll();
    String newFilterName = randomAlphabetic(5);
    String newFilterCode = randomAlphabetic(5);
    topicDetails
        .setFilterCodeFldAddFilterMdl(newFilterCode)
        .setDisplayNameFldAddFilterMdl(newFilterName)
        .clickSaveFilterBtnAndCloseMdl(true);
    softly.assertTrue(topicDetails.isActiveFilterVisible(newFilterName), "isActiveFilterVisible()");
    softly.assertEquals(topicDetails.getSearchFieldValue(), newFilterCode, "getSearchFieldValue()");
    softly.assertAll();
  }

  @QaseId(13)
  @Test(priority = 14)
  public void checkFilterSavingWithinSavedFilters() {
    String displayName = randomAlphabetic(5);
    navigateToTopicsAndOpenDetails(TOPIC_FOR_CHECK_FILTERS.getName());
    topicDetails
        .openDetailsTab(MESSAGES)
        .clickMessagesAddFiltersBtn()
        .waitUntilAddFiltersMdlVisible()
        .setFilterCodeFldAddFilterMdl(randomAlphabetic(4))
        .selectSaveThisFilterCheckboxMdl(true)
        .setDisplayNameFldAddFilterMdl(displayName);
    Assert.assertTrue(topicDetails.isAddFilterBtnAddFilterMdlEnabled(),
        "isAddFilterBtnAddFilterMdlEnabled()");
    topicDetails
        .clickAddFilterBtnAndCloseMdl(false)
        .openSavedFiltersListMdl();
    Assert.assertTrue(topicDetails.isFilterVisibleAtSavedFiltersMdl(displayName),
        "isFilterVisibleAtSavedFiltersMdl()");
  }

  @QaseId(14)
  @Test(priority = 15)
  public void checkApplyingSavedFilterWithinTopicMessages() {
    String displayName = randomAlphabetic(5);
    navigateToTopicsAndOpenDetails(TOPIC_FOR_CHECK_FILTERS.getName());
    topicDetails
        .openDetailsTab(MESSAGES)
        .clickMessagesAddFiltersBtn()
        .waitUntilAddFiltersMdlVisible()
        .setFilterCodeFldAddFilterMdl(randomAlphabetic(4))
        .selectSaveThisFilterCheckboxMdl(true)
        .setDisplayNameFldAddFilterMdl(displayName)
        .clickAddFilterBtnAndCloseMdl(false)
        .openSavedFiltersListMdl()
        .selectFilterAtSavedFiltersMdl(displayName)
        .clickSelectFilterBtnAtSavedFiltersMdl();
    Assert.assertTrue(topicDetails.isActiveFilterVisible(displayName), "isActiveFilterVisible()");
  }

  @QaseId(11)
  @Test(priority = 16)
  public void checkShowInternalTopicsButton() {
    navigateToTopics();
    topicsList
        .setShowInternalRadioButton(true);
    Assert.assertTrue(topicsList.getInternalTopics().size() > 0, "getInternalTopics()");
    topicsList
        .goToLastPage();
    Assert.assertTrue(topicsList.getNonInternalTopics().size() > 0, "getNonInternalTopics()");
    topicsList
        .setShowInternalRadioButton(false);
    SoftAssert softly = new SoftAssert();
    softly.assertEquals(topicsList.getInternalTopics().size(), 0, "getInternalTopics()");
    softly.assertTrue(topicsList.getNonInternalTopics().size() > 0, "getNonInternalTopics()");
    softly.assertAll();
  }

  @QaseId(334)
  @Test(priority = 17)
  public void checkInternalTopicsNaming() {
    navigateToTopics();
    SoftAssert softly = new SoftAssert();
    topicsList
        .setShowInternalRadioButton(true)
        .getInternalTopics()
        .forEach(topic -> softly.assertTrue(topic.getName().startsWith("_"),
            String.format("'%s' starts with '_'", topic.getName())));
    softly.assertAll();
  }

  @QaseId(56)
  @Test(priority = 18)
  public void checkRetentionBytesAccordingToMaxSizeOnDisk() {
    navigateToTopics();
    topicsList
        .clickAddTopicBtn();
    topicCreateEditForm
        .waitUntilScreenReady()
        .setTopicName(TOPIC_TO_CHECK_SETTINGS.getName())
        .setNumberOfPartitions(TOPIC_TO_CHECK_SETTINGS.getNumberOfPartitions())
        .setMaxMessageBytes(TOPIC_TO_CHECK_SETTINGS.getMaxMessageBytes())
        .clickSaveTopicBtn();
    topicDetails
        .waitUntilScreenReady();
    TOPIC_LIST.add(TOPIC_TO_CHECK_SETTINGS);
    topicDetails
        .openDetailsTab(SETTINGS);
    topicSettingsTab
        .waitUntilScreenReady();
    SoftAssert softly = new SoftAssert();
    softly.assertEquals(topicSettingsTab.getValueByKey("retention.bytes"),
        TOPIC_TO_CHECK_SETTINGS.getMaxSizeOnDisk().getOptionValue(), "getValueOfKey(retention.bytes)");
    softly.assertEquals(topicSettingsTab.getValueByKey("max.message.bytes"),
        TOPIC_TO_CHECK_SETTINGS.getMaxMessageBytes(), "getValueOfKey(max.message.bytes)");
    softly.assertAll();
    TOPIC_TO_CHECK_SETTINGS
        .setMaxSizeOnDisk(SIZE_1_GB)
        .setMaxMessageBytes("1000056");
    topicDetails
        .openDotMenu()
        .clickEditSettingsMenu();
    topicCreateEditForm
        .waitUntilScreenReady()
        .setMaxSizeOnDiskInGB(TOPIC_TO_CHECK_SETTINGS.getMaxSizeOnDisk())
        .setMaxMessageBytes(TOPIC_TO_CHECK_SETTINGS.getMaxMessageBytes())
        .clickSaveTopicBtn();
    topicDetails
        .waitUntilScreenReady()
        .openDetailsTab(SETTINGS);
    topicSettingsTab
        .waitUntilScreenReady();
    softly.assertEquals(topicSettingsTab.getValueByKey("retention.bytes"),
        TOPIC_TO_CHECK_SETTINGS.getMaxSizeOnDisk().getOptionValue(), "getValueOfKey(retention.bytes)");
    softly.assertEquals(topicSettingsTab.getValueByKey("max.message.bytes"),
        TOPIC_TO_CHECK_SETTINGS.getMaxMessageBytes(), "getValueOfKey(max.message.bytes)");
    softly.assertAll();
  }

  @QaseId(247)
  @Test(priority = 19)
  public void recreateTopicFromTopicProfile() {
    Topic topicToRecreate = new Topic()
        .setName("topic-to-recreate-" + randomAlphabetic(5))
        .setNumberOfPartitions(1);
    navigateToTopics();
    topicsList
        .clickAddTopicBtn();
    topicCreateEditForm
        .waitUntilScreenReady()
        .setTopicName(topicToRecreate.getName())
        .setNumberOfPartitions(topicToRecreate.getNumberOfPartitions())
        .clickSaveTopicBtn();
    topicDetails
        .waitUntilScreenReady();
    TOPIC_LIST.add(topicToRecreate);
    topicDetails
        .openDotMenu()
        .clickRecreateTopicMenu();
    Assert.assertTrue(topicDetails.isConfirmationMdlVisible(), "isConfirmationMdlVisible()");
    topicDetails
        .clickConfirmBtnMdl();
    Assert.assertTrue(topicDetails.isAlertWithMessageVisible(SUCCESS,
            String.format("Topic %s successfully recreated!", topicToRecreate.getName())),
        "isAlertWithMessageVisible()");
  }

  @QaseId(8)
  @Test(priority = 20)
  public void checkCopyTopicPossibility() {
    Topic topicToCopy = new Topic()
        .setName("topic-to-copy-" + randomAlphabetic(5))
        .setNumberOfPartitions(1);
    navigateToTopics();
    topicsList
        .getAnyNonInternalTopic()
        .selectItem(true)
        .clickCopySelectedTopicBtn();
    topicCreateEditForm
        .waitUntilScreenReady();
    Assert.assertFalse(topicCreateEditForm.isCreateTopicButtonEnabled(), "isCreateTopicButtonEnabled()");
    topicCreateEditForm
        .setTopicName(topicToCopy.getName())
        .setNumberOfPartitions(topicToCopy.getNumberOfPartitions())
        .clickSaveTopicBtn();
    topicDetails
        .waitUntilScreenReady();
    TOPIC_LIST.add(topicToCopy);
    Assert.assertTrue(topicDetails.isTopicHeaderVisible(topicToCopy.getName()), "isTopicHeaderVisible()");
  }

  @AfterClass(alwaysRun = true)
  public void afterClass() {
    TOPIC_LIST.forEach(topic -> apiService.deleteTopic(topic.getName()));
  }
}
