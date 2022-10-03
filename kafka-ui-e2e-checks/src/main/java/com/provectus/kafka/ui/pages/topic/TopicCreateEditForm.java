package com.provectus.kafka.ui.pages.topic;

import com.codeborne.selenide.ClickOptions;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;
import static org.assertj.core.api.Assertions.assertThat;

public class TopicCreateEditForm {

    private final SelenideElement timeToRetain = $(By.cssSelector("input#timeToRetain"));
    private final SelenideElement maxMessageBytes = $(By.name("maxMessageBytes"));
    @Step
    public TopicCreateEditForm setTopicName(String topicName) {
        $("input#topicFormName").setValue(topicName);
        return this;
    }
    @Step
    public TopicCreateEditForm setMinInsyncReplicas(Integer minInsyncReplicas) {
        $("input[name=minInSyncReplicas]").setValue(minInsyncReplicas.toString());
        return this;
    }
    @Step
    public TopicCreateEditForm setTimeToRetainDataInMs(Long ms) {
        timeToRetain.setValue(ms.toString());
        return this;
    }
    @Step
    public TopicCreateEditForm setTimeToRetainDataInMs(String ms) {
        timeToRetain.setValue(ms);
        return this;
    }

    @Step
    public TopicCreateEditForm setMaxSizeOnDiskInGB(String value) {
        KafkaUISelectElement kafkaUISelectElement = new KafkaUISelectElement("retentionBytes");
        kafkaUISelectElement.selectByVisibleText(value);
        return this;
    }
    @Step
    public TopicCreateEditForm setMaxMessageBytes(Long bytes) {
        maxMessageBytes.setValue(bytes.toString());
        return this;
    }
    @Step
    public TopicCreateEditForm setMaxMessageBytes(String bytes) {
        return setMaxMessageBytes(Long.parseLong(bytes));
    }
    @Step
    public TopicCreateEditForm setTimeToRetainDataInMsUsingButtons(String value) {
        timeToRetain
                .parent()
                .parent()
                .$$("button")
                .find(Condition.exactText(value))
                .click();
        return this;
    }

    @Step
    public TopicCreateEditForm selectCleanupPolicy(CleanupPolicyValue cleanupPolicyValue) {
        return selectFromDropDownByOptionValue("cleanupPolicy",
                cleanupPolicyValue.getOptionValue());
    }
    @Step
    public TopicCreateEditForm selectCleanupPolicy(String cleanupPolicyOptionValue) {
        $("ul#topicFormCleanupPolicy").click();
        $x("//li[text()='" + cleanupPolicyOptionValue + "']").click();
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
    public TopicDetails sendData() {
        clickByJavaScript($x("//button[@type='submit']"));
        return new TopicDetails();
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
        String value = timeToRetain.getValue();
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
        return timeToRetain.getValue();
    }

    @Step
    public String getMaxSizeOnDisk() {
        return new KafkaUISelectElement("retentionBytes").getCurrentValue();
    }

    @Step
    public String getMaxMessageBytes() {
        return maxMessageBytes.getValue();
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
