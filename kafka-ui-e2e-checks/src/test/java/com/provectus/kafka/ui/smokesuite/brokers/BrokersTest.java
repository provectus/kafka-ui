package com.provectus.kafka.ui.smokesuite.brokers;

import static com.provectus.kafka.ui.pages.brokers.BrokersDetails.DetailsTab.CONFIGS;
import static com.provectus.kafka.ui.utilities.StringUtils.getMixedCase;
import static com.provectus.kafka.ui.variables.Expected.BROKER_SOURCE_INFO_TOOLTIP;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.BaseTest;
import com.provectus.kafka.ui.pages.brokers.BrokersConfigTab;
import io.qameta.allure.Issue;
import io.qase.api.annotation.QaseId;
import java.util.List;
import org.testng.Assert;
import org.testng.annotations.Ignore;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

public class BrokersTest extends BaseTest {

  public static final int DEFAULT_BROKER_ID = 1;

  @QaseId(1)
  @Test
  public void checkBrokersOverview() {
    navigateToBrokers();
    Assert.assertTrue(brokersList.getAllBrokers().size() > 0, "getAllBrokers()");
    verifyElementsCondition(brokersList.getAllVisibleElements(), Condition.visible);
    verifyElementsCondition(brokersList.getAllEnabledElements(), Condition.enabled);
  }

  @QaseId(85)
  @Test
  public void checkExistingBrokersInCluster() {
    navigateToBrokers();
    Assert.assertTrue(brokersList.getAllBrokers().size() > 0, "getAllBrokers()");
    brokersList
        .openBroker(DEFAULT_BROKER_ID);
    brokersDetails
        .waitUntilScreenReady();
    verifyElementsCondition(brokersDetails.getAllVisibleElements(), Condition.visible);
    verifyElementsCondition(brokersDetails.getAllEnabledElements(), Condition.enabled);
    brokersDetails
        .openDetailsTab(CONFIGS);
    brokersConfigTab
        .waitUntilScreenReady();
    verifyElementsCondition(brokersConfigTab.getColumnHeaders(), Condition.visible);
    verifyElementsCondition(brokersConfigTab.getEditButtons(), Condition.enabled);
    Assert.assertTrue(brokersConfigTab.isSearchByKeyVisible(), "isSearchByKeyVisible()");
  }

  @Ignore
  @Issue("https://github.com/provectus/kafka-ui/issues/3347")
  @QaseId(330)
  @Test
  public void brokersConfigFirstPageSearchCheck() {
    navigateToBrokersAndOpenDetails(DEFAULT_BROKER_ID);
    brokersDetails
        .openDetailsTab(CONFIGS);
    String anyConfigKeyFirstPage = brokersConfigTab
        .getAllConfigs().stream()
        .findAny().orElseThrow()
        .getKey();
    brokersConfigTab
        .clickNextButton();
    Assert.assertFalse(brokersConfigTab.getAllConfigs().stream()
            .map(BrokersConfigTab.BrokersConfigItem::getKey)
            .toList().contains(anyConfigKeyFirstPage),
        String.format("getAllConfigs().contains(%s)", anyConfigKeyFirstPage));
    brokersConfigTab
        .searchConfig(anyConfigKeyFirstPage);
    Assert.assertTrue(brokersConfigTab.getAllConfigs().stream()
            .map(BrokersConfigTab.BrokersConfigItem::getKey)
            .toList().contains(anyConfigKeyFirstPage),
        String.format("getAllConfigs().contains(%s)", anyConfigKeyFirstPage));
  }

  @Ignore
  @Issue("https://github.com/provectus/kafka-ui/issues/3347")
  @QaseId(350)
  @Test
  public void brokersConfigSecondPageSearchCheck() {
    navigateToBrokersAndOpenDetails(DEFAULT_BROKER_ID);
    brokersDetails
        .openDetailsTab(CONFIGS);
    brokersConfigTab
        .clickNextButton();
    String anyConfigKeySecondPage = brokersConfigTab
        .getAllConfigs().stream()
        .findAny().orElseThrow()
        .getKey();
    brokersConfigTab
        .clickPreviousButton();
    Assert.assertFalse(brokersConfigTab.getAllConfigs().stream()
            .map(BrokersConfigTab.BrokersConfigItem::getKey)
            .toList().contains(anyConfigKeySecondPage),
        String.format("getAllConfigs().contains(%s)", anyConfigKeySecondPage));
    brokersConfigTab
        .searchConfig(anyConfigKeySecondPage);
    Assert.assertTrue(brokersConfigTab.getAllConfigs().stream()
            .map(BrokersConfigTab.BrokersConfigItem::getKey)
            .toList().contains(anyConfigKeySecondPage),
        String.format("getAllConfigs().contains(%s)", anyConfigKeySecondPage));
  }

  @Ignore
  @Issue("https://github.com/provectus/kafka-ui/issues/3347")
  @QaseId(348)
  @Test
  public void brokersConfigCaseInsensitiveSearchCheck() {
    navigateToBrokersAndOpenDetails(DEFAULT_BROKER_ID);
    brokersDetails
        .openDetailsTab(CONFIGS);
    String anyConfigKeyFirstPage = brokersConfigTab
        .getAllConfigs().stream()
        .findAny().orElseThrow()
        .getKey();
    brokersConfigTab
        .clickNextButton();
    Assert.assertFalse(brokersConfigTab.getAllConfigs().stream()
            .map(BrokersConfigTab.BrokersConfigItem::getKey)
            .toList().contains(anyConfigKeyFirstPage),
        String.format("getAllConfigs().contains(%s)", anyConfigKeyFirstPage));
    SoftAssert softly = new SoftAssert();
    List.of(anyConfigKeyFirstPage.toLowerCase(), anyConfigKeyFirstPage.toUpperCase(),
            getMixedCase(anyConfigKeyFirstPage))
        .forEach(configCase -> {
          brokersConfigTab
              .searchConfig(configCase);
          softly.assertTrue(brokersConfigTab.getAllConfigs().stream()
                  .map(BrokersConfigTab.BrokersConfigItem::getKey)
                  .toList().contains(anyConfigKeyFirstPage),
              String.format("getAllConfigs().contains(%s)", configCase));
        });
    softly.assertAll();
  }

  @QaseId(331)
  @Test
  public void brokersSourceInfoCheck() {
    navigateToBrokersAndOpenDetails(DEFAULT_BROKER_ID);
    brokersDetails
        .openDetailsTab(CONFIGS);
    String sourceInfoTooltip = brokersConfigTab
        .hoverOnSourceInfoIcon()
        .getSourceInfoTooltipText();
    Assert.assertEquals(sourceInfoTooltip, BROKER_SOURCE_INFO_TOOLTIP, "brokerSourceInfoTooltip");
  }

  @QaseId(332)
  @Test
  public void brokersConfigEditCheck() {
    navigateToBrokersAndOpenDetails(DEFAULT_BROKER_ID);
    brokersDetails
        .openDetailsTab(CONFIGS);
    String configKey = "log.cleaner.min.compaction.lag.ms";
    BrokersConfigTab.BrokersConfigItem configItem = brokersConfigTab
        .searchConfig(configKey)
        .getConfig(configKey);
    int defaultValue = Integer.parseInt(configItem.getValue());
    configItem
        .clickEditBtn();
    SoftAssert softly = new SoftAssert();
    softly.assertTrue(configItem.getSaveBtn().isDisplayed(), "getSaveBtn().isDisplayed()");
    softly.assertTrue(configItem.getCancelBtn().isDisplayed(), "getCancelBtn().isDisplayed()");
    softly.assertTrue(configItem.getValueFld().isEnabled(), "getValueFld().isEnabled()");
    softly.assertAll();
    int newValue = defaultValue + 1;
    configItem
        .setValue(String.valueOf(newValue))
        .clickCancelBtn();
    Assert.assertEquals(Integer.parseInt(configItem.getValue()), defaultValue, "getValue()");
    configItem
        .clickEditBtn()
        .setValue(String.valueOf(newValue))
        .clickSaveBtn()
        .clickConfirm();
    configItem = brokersConfigTab
        .searchConfig(configKey)
        .getConfig(configKey);
    softly.assertFalse(configItem.getSaveBtn().isDisplayed(), "getSaveBtn().isDisplayed()");
    softly.assertFalse(configItem.getCancelBtn().isDisplayed(), "getCancelBtn().isDisplayed()");
    softly.assertTrue(configItem.getEditBtn().isDisplayed(), "getEditBtn().isDisplayed()");
    softly.assertEquals(Integer.parseInt(configItem.getValue()), newValue, "getValue()");
    softly.assertAll();
  }
}
