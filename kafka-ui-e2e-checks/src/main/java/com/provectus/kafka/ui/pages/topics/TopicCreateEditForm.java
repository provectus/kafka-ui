package com.provectus.kafka.ui.pages.topics;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;
import static com.codeborne.selenide.Selenide.$x;
import static org.openqa.selenium.By.id;

import com.codeborne.selenide.ClickOptions;
import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import com.provectus.kafka.ui.pages.topics.enums.CleanupPolicyValue;
import com.provectus.kafka.ui.pages.topics.enums.CustomParameterType;
import com.provectus.kafka.ui.pages.topics.enums.MaxSizeOnDisk;
import com.provectus.kafka.ui.pages.topics.enums.TimeToRetain;
import io.qameta.allure.Step;

public class TopicCreateEditForm extends BasePage {

  private static final String RETENTION_BYTES = "retentionBytes";

  protected SelenideElement timeToRetainField = $x("//input[@id='timeToRetain']");
  protected SelenideElement partitionsField = $x("//input[@name='partitions']");
  protected SelenideElement nameField = $(id("topicFormName"));
  protected SelenideElement maxMessageBytesField = $x("//input[@name='maxMessageBytes']");
  protected SelenideElement minInSyncReplicasField = $x("//input[@name='minInSyncReplicas']");
  protected SelenideElement cleanUpPolicyDdl = $x("//ul[@id='topicFormCleanupPolicy']");
  protected SelenideElement maxSizeOnDiscDdl = $x("//ul[@id='topicFormRetentionBytes']");
  protected SelenideElement customParameterDdl = $x("//ul[contains(@name,'customParams')]");
  protected SelenideElement deleteCustomParameterBtn = $x("//span[contains(@title,'Delete customParam')]");
  protected SelenideElement addCustomParameterTypeBtn = $x("//button[contains(text(),'Add Custom Parameter')]");
  protected SelenideElement customParameterValueField = $x("//input[@placeholder='Value']");
  protected SelenideElement validationCustomParameterValueMsg = $x("//p[contains(text(),'Value is required')]");
  protected String ddlElementLocator = "//li[@value='%s']";
  protected String btnTimeToRetainLocator = "//button[@class][text()='%s']";


  @Step
  public TopicCreateEditForm waitUntilScreenReady() {
    waitUntilSpinnerDisappear();
    nameField.shouldBe(Condition.visible);
    return this;
  }

  public boolean isCreateTopicButtonEnabled() {
    return isEnabled(submitBtn);
  }

  public boolean isDeleteCustomParameterButtonEnabled() {
    return isEnabled(deleteCustomParameterBtn);
  }

  public boolean isNameFieldEnabled() {
    return isEnabled(nameField);
  }

  @Step
  public TopicCreateEditForm setTopicName(String topicName) {
    sendKeysAfterClear(nameField, topicName);
    return this;
  }

  @Step
  public TopicCreateEditForm setMinInsyncReplicas(Integer minInsyncReplicas) {
    minInSyncReplicasField.setValue(minInsyncReplicas.toString());
    return this;
  }

  @Step
  public TopicCreateEditForm setTimeToRetainDataInMs(Long ms) {
    timeToRetainField.setValue(ms.toString());
    return this;
  }

  @Step
  public TopicCreateEditForm setTimeToRetainDataInMs(String ms) {
    timeToRetainField.setValue(ms);
    return this;
  }

  @Step
  public TopicCreateEditForm setMaxSizeOnDiskInGB(MaxSizeOnDisk maxSizeOnDisk) {
    maxSizeOnDiscDdl.shouldBe(Condition.visible).click();
    $x(String.format(ddlElementLocator, maxSizeOnDisk.getOptionValue())).shouldBe(Condition.visible).click();
    return this;
  }

  @Step
  public TopicCreateEditForm clickAddCustomParameterTypeButton() {
    addCustomParameterTypeBtn.click();
    return this;
  }

  @Step
  public TopicCreateEditForm openCustomParameterTypeDdl() {
    customParameterDdl.shouldBe(Condition.visible).click();
    ddlOptions.shouldHave(CollectionCondition.sizeGreaterThan(0));
    return this;
  }

  @Step
  public ElementsCollection getAllDdlOptions() {
    return getDdlOptions();
  }

  @Step
  public TopicCreateEditForm setCustomParameterType(CustomParameterType customParameterType) {
    openCustomParameterTypeDdl();
    $x(String.format(ddlElementLocator, customParameterType.getOptionValue())).shouldBe(Condition.visible).click();
    return this;
  }

  @Step
  public TopicCreateEditForm clearCustomParameterValue() {
    clearByKeyboard(customParameterValueField);
    return this;
  }

  @Step
  public TopicCreateEditForm setNumberOfPartitions(int partitions) {
    partitionsField.shouldBe(Condition.enabled).clear();
    partitionsField.sendKeys(String.valueOf(partitions));
    return this;
  }

  @Step
  public TopicCreateEditForm setTimeToRetainDataByButtons(TimeToRetain timeToRetain) {
    $x(String.format(btnTimeToRetainLocator, timeToRetain.getButton())).shouldBe(Condition.enabled).click();
    return this;
  }

  @Step
  public TopicCreateEditForm selectCleanupPolicy(CleanupPolicyValue cleanupPolicyOptionValue) {
    cleanUpPolicyDdl.shouldBe(Condition.visible).click();
    $x(String.format(ddlElementLocator, cleanupPolicyOptionValue.getOptionValue())).shouldBe(Condition.visible).click();
    return this;
  }

  @Step
  public TopicCreateEditForm selectRetentionBytes(String visibleValue) {
    return selectFromDropDownByVisibleText(RETENTION_BYTES, visibleValue);
  }

  @Step
  public TopicCreateEditForm selectRetentionBytes(Long optionValue) {
    return selectFromDropDownByOptionValue(RETENTION_BYTES, optionValue.toString());
  }

  @Step
  public TopicCreateEditForm clickSaveTopicBtn() {
    clickSubmitBtn();
    return this;
  }

  @Step
  public TopicCreateEditForm addCustomParameter(String customParameterName,
                                                String customParameterValue) {
    ElementsCollection customParametersElements =
        $$("ul[role=listbox][name^=customParams][name$=name]");
    KafkaUiSelectElement kafkaUiSelectElement = null;
    if (customParametersElements.size() == 1) {
      if ("Select".equals(customParametersElements.first().getText())) {
        kafkaUiSelectElement = new KafkaUiSelectElement(customParametersElements.first());
      }
    } else {
      $$("button")
          .find(Condition.exactText("Add Custom Parameter"))
          .click();
      customParametersElements = $$("ul[role=listbox][name^=customParams][name$=name]");
      kafkaUiSelectElement = new KafkaUiSelectElement(customParametersElements.last());
    }
    if (kafkaUiSelectElement != null) {
      kafkaUiSelectElement.selectByVisibleText(customParameterName);
    }
    $(String.format("input[name=\"customParams.%d.value\"]", customParametersElements.size() - 1))
        .setValue(customParameterValue);
    return this;
  }

  @Step
  public TopicCreateEditForm updateCustomParameter(String customParameterName,
                                                   String customParameterValue) {
    SelenideElement selenideElement = $$("ul[role=listbox][name^=customParams][name$=name]")
        .find(Condition.exactText(customParameterName));
    String name = selenideElement.getAttribute("name");
    if (name != null) {
      name = name.substring(0, name.lastIndexOf("."));
    }
    $(String.format("input[name^=%s]", name)).setValue(customParameterValue);
    return this;
  }

  @Step
  public String getCleanupPolicy() {
    return new KafkaUiSelectElement("cleanupPolicy").getCurrentValue();
  }

  @Step
  public String getTimeToRetain() {
    return timeToRetainField.getValue();
  }

  @Step
  public String getMaxSizeOnDisk() {
    return new KafkaUiSelectElement(RETENTION_BYTES).getCurrentValue();
  }

  @Step
  public String getMaxMessageBytes() {
    return maxMessageBytesField.getValue();
  }

  @Step
  public TopicCreateEditForm setMaxMessageBytes(Long bytes) {
    maxMessageBytesField.setValue(bytes.toString());
    return this;
  }

  @Step
  public TopicCreateEditForm setMaxMessageBytes(String bytes) {
    return setMaxMessageBytes(Long.parseLong(bytes));
  }

  @Step
  public boolean isValidationMessageCustomParameterValueVisible() {
    return isVisible(validationCustomParameterValueMsg);
  }

  @Step
  public String getCustomParameterValue() {
    return customParameterValueField.getValue();
  }

  private TopicCreateEditForm selectFromDropDownByOptionValue(String dropDownElementName,
                                                              String optionValue) {
    KafkaUiSelectElement select = new KafkaUiSelectElement(dropDownElementName);
    select.selectByOptionValue(optionValue);
    return this;
  }

  private TopicCreateEditForm selectFromDropDownByVisibleText(String dropDownElementName,
                                                              String visibleText) {
    KafkaUiSelectElement select = new KafkaUiSelectElement(dropDownElementName);
    select.selectByVisibleText(visibleText);
    return this;
  }

  private static class KafkaUiSelectElement {

    private final SelenideElement selectElement;

    public KafkaUiSelectElement(String selectElementName) {
      this.selectElement = $("ul[role=listbox][name=" + selectElementName + "]");
    }

    public KafkaUiSelectElement(SelenideElement selectElement) {
      this.selectElement = selectElement;
    }

    public void selectByOptionValue(String optionValue) {
      selectElement.click();
      selectElement
          .$$x(".//ul/li[@role='option']")
          .find(Condition.attribute("value", optionValue))
          .click(ClickOptions.usingJavaScript());
    }

    public void selectByVisibleText(String visibleText) {
      selectElement.click();
      selectElement
          .$$("ul>li[role=option]")
          .find(Condition.exactText(visibleText))
          .click();
    }

    public String getCurrentValue() {
      return selectElement.$("li").getText();
    }
  }
}
