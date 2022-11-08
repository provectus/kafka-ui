package com.provectus.kafka.ui.pages.topic;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;
import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.utilities.WebUtils.clearByKeyboard;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;
import static com.provectus.kafka.ui.utilities.WebUtils.isEnabled;
import static com.provectus.kafka.ui.utilities.WebUtils.isVisible;
import static org.assertj.core.api.Assertions.assertThat;

import com.codeborne.selenide.ClickOptions;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;

public class TopicCreateEditForm {

  protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
  protected SelenideElement timeToRetainField = $x("//input[@id='timeToRetain']");
  protected SelenideElement partitionsField = $x("//input[@name='partitions']");
  protected SelenideElement nameField = $x("//input[@name='name']");
  protected SelenideElement maxMessageBytesField = $x("//input[@name='maxMessageBytes']");
  protected SelenideElement minInSyncReplicasField = $x("//input[@name='minInSyncReplicas']");
  protected SelenideElement cleanUpPolicyDdl = $x("//ul[@id='topicFormCleanupPolicy']");
  protected SelenideElement maxSizeOnDiscDdl = $x("//ul[@id='topicFormRetentionBytes']");
  protected SelenideElement customParameterDdl = $x("//ul[contains(@name,'customParams')]");
  protected SelenideElement createTopicBtn = $x("//button[@type='submit']");
  protected SelenideElement deleteCustomParameterBtn = $x("//span[contains(@title,'Delete customParam')]");
  protected SelenideElement addCustomParameterTypeBtn = $x("//button/*/*");
  protected SelenideElement customParameterValueField = $x("//input[@placeholder='Value']");
  protected SelenideElement validationCustomParameterValueMsg = $x("//p[contains(text(),'Value is required')]");
  protected String ddlElementLocator = "//li[@value='%s']";

  @Step
  public TopicCreateEditForm waitUntilScreenReady() {
    loadingSpinner.shouldBe(Condition.disappear);
    nameField.shouldBe(Condition.visible);
    return this;
  }

  @Step
  public TopicCreateEditForm setTopicName(String topicName) {
    nameField.setValue(topicName);
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
  public TopicCreateEditForm setMaxSizeOnDiskInGB(MaxSizeOnDisk MaxSizeOnDisk) {
    maxSizeOnDiscDdl.shouldBe(Condition.visible).click();
    $x(String.format(ddlElementLocator, MaxSizeOnDisk.getOptionValue())).shouldBe(Condition.visible).click();
    return this;
  }

  @Step
  public TopicCreateEditForm clickAddCustomParameterTypeButton() {
    addCustomParameterTypeBtn.click();
    return this;
  }

  @Step
  public TopicCreateEditForm setCustomParameterType(CustomParameterType CustomParameterType) {
    customParameterDdl.shouldBe(Condition.visible).click();
    $x(String.format(ddlElementLocator, CustomParameterType.getOptionValue())).shouldBe(Condition.visible).click();
    return this;
  }

  @Step
  public TopicCreateEditForm clearCustomParameterValue() {
    clearByKeyboard(customParameterValueField);
    return this;
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
  public TopicCreateEditForm setPartitions(String partitions) {
    partitionsField.setValue(partitions);
    return this;
  }

  @Step
  public TopicCreateEditForm setTimeToRetainDataInMsUsingButtons(String value) {
    timeToRetainField
        .parent()
        .parent()
        .$$("button")
        .find(Condition.exactText(value))
        .click();
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
    return selectFromDropDownByVisibleText("retentionBytes", visibleValue);
  }

  @Step
  public TopicCreateEditForm selectRetentionBytes(Long optionValue) {
    return selectFromDropDownByOptionValue("retentionBytes", optionValue.toString());
  }

  @Step
  public TopicCreateEditForm clickCreateTopicBtn() {
    clickByJavaScript(createTopicBtn);
    return this;
  }

  @Step
  public TopicCreateEditForm addCustomParameter(String customParameterName,
                                                String customParameterValue) {
    ElementsCollection customParametersElements =
        $$("ul[role=listbox][name^=customParams][name$=name]");
    KafkaUISelectElement kafkaUISelectElement = null;
    if (customParametersElements.size() == 1) {
      if ("Select".equals(customParametersElements.first().getText())) {
        kafkaUISelectElement = new KafkaUISelectElement(customParametersElements.first());
      }
    } else {
      $$("button")
          .find(Condition.exactText("Add Custom Parameter"))
          .click();
      customParametersElements = $$("ul[role=listbox][name^=customParams][name$=name]");
      kafkaUISelectElement = new KafkaUISelectElement(customParametersElements.last());
    }
    if (kafkaUISelectElement != null) {
      kafkaUISelectElement.selectByVisibleText(customParameterName);
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
  public TopicCreateEditForm cleanupPolicyIs(String value) {
    String cleanupPolicy = new KafkaUISelectElement("cleanupPolicy")
        .getCurrentValue();
    assertThat(cleanupPolicy)
        .as("Clear policy value should be " + value)
        .isEqualToIgnoringCase(value);
    return this;
  }

  @Step
  public TopicCreateEditForm timeToRetainIs(String time) {
    String value = timeToRetainField.getValue();
    assertThat(value)
        .as("Time to retain data (in ms) should be " + time)
        .isEqualTo(time);
    return this;
  }

  @Step
  public String getCleanupPolicy() {
    return new KafkaUISelectElement("cleanupPolicy").getCurrentValue();
  }

  @Step
  public String getTimeToRetain() {
    return timeToRetainField.getValue();
  }

  @Step
  public String getMaxSizeOnDisk() {
    return new KafkaUISelectElement("retentionBytes").getCurrentValue();
  }

  @Step
  public String getMaxMessageBytes() {
    return maxMessageBytesField.getValue();
  }

  @Step
  public boolean isValidationMessageCustomParameterValueVisible() {
    return isVisible(validationCustomParameterValueMsg);
  }

  @Step
  public String getCustomParameterValue() {
    return customParameterValueField.getValue();
  }

  private static class KafkaUISelectElement {

    private final SelenideElement selectElement;

    public KafkaUISelectElement(String selectElementName) {
      this.selectElement = $("ul[role=listbox][name=" + selectElementName + "]");
    }

    public KafkaUISelectElement(SelenideElement selectElement) {
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

  public enum CleanupPolicyValue {
    DELETE("delete", "Delete"),
    COMPACT("compact", "Compact"),
    COMPACT_DELETE("compact,delete", "Compact,Delete");

    private final String optionValue;
    private final String visibleText;

    CleanupPolicyValue(String optionValue, String visibleText) {
      this.optionValue = optionValue;
      this.visibleText = visibleText;
    }

    public String getOptionValue() {
      return optionValue;
    }

    public String getVisibleText() {
      return visibleText;
    }
  }

  public enum MaxSizeOnDisk {
    NOT_SET("-1", "Not Set"),
    SIZE_1_GB("1073741824", "1 GB"),
    SIZE_10_GB("10737418240", "10 GB"),
    SIZE_20_GB("21474836480", "20 GB"),
    SIZE_50_GB("53687091200", "50 GB");

    private final String optionValue;
    private final String visibleText;

    MaxSizeOnDisk(String optionValue, String visibleText) {
      this.optionValue = optionValue;
      this.visibleText = visibleText;
    }

    public String getOptionValue() {
      return optionValue;
    }

    public String getVisibleText() {
      return visibleText;
    }
  }

  public enum CustomParameterType {
    COMPRESSION_TYPE("compression.type"),
    DELETE_RETENTION_MS("delete.retention.ms"),
    FILE_DELETE_DELAY_MS("file.delete.delay.ms"),
    FLUSH_MESSAGES("flush.messages"),
    FLUSH_MS("flush.ms"),
    FOLLOWER_REPLICATION_THROTTLED_REPLICAS("follower.replication.throttled.replicas"),
    INDEX_INTERVAL_BYTES("index.interval.bytes"),
    LEADER_REPLICATION_THROTTLED_REPLICAS("leader.replication.throttled.replicas"),
    MAX_COMPACTION_LAG_MS("max.compaction.lag.ms"),
    MESSAGE_DOWNCONVERSION_ENABLE("message.downconversion.enable"),
    MESSAGE_FORMAT_VERSION("message.format.version"),
    MESSAGE_TIMESTAMP_DIFFERENCE_MAX_MS("message.timestamp.difference.max.ms"),
    MESSAGE_TIMESTAMP_TYPE("message.timestamp.type"),
    MIN_CLEANABLE_DIRTY_RATIO("min.cleanable.dirty.ratio"),
    MIN_COMPACTION_LAG_MS("min.compaction.lag.ms"),
    PREALLOCATE("preallocate"),
    RETENTION_BYTES("retention.bytes"),
    SEGMENT_BYTES("segment.bytes"),
    SEGMENT_INDEX_BYTES("segment.index.bytes"),
    SEGMENT_JITTER_MS("segment.jitter.ms"),
    SEGMENT_MS("segment.ms"),
    UNCLEAN_LEADER_ELECTION_ENABLE("unclean.leader.election.enable");

    private final String optionValue;

    CustomParameterType(String optionValue) {
      this.optionValue = optionValue;
    }

    public String getOptionValue() {
      return optionValue;
    }
  }

  public boolean isCreateTopicButtonEnabled() {
    return isEnabled(createTopicBtn);
  }

  public boolean isDeleteCustomParameterButtonEnabled() {
    return isEnabled(deleteCustomParameterBtn);
  }

  private TopicCreateEditForm selectFromDropDownByOptionValue(String dropDownElementName,
                                                              String optionValue) {
    KafkaUISelectElement select = new KafkaUISelectElement(dropDownElementName);
    select.selectByOptionValue(optionValue);
    return this;
  }

  private TopicCreateEditForm selectFromDropDownByVisibleText(String dropDownElementName,
                                                              String visibleText) {
    KafkaUISelectElement select = new KafkaUISelectElement(dropDownElementName);
    select.selectByVisibleText(visibleText);
    return this;
  }
}
