package com.provectus.kafka.ui.pages.topic;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;
import static com.codeborne.selenide.Selenide.$x;
import static org.assertj.core.api.Assertions.assertThat;

import com.codeborne.selenide.*;
import com.provectus.kafka.ui.utils.BrowserUtils;
import org.openqa.selenium.By;

public class TopicCreateEditSettingsView {

    private final SelenideElement timeToRetain = $(By.cssSelector("input#timeToRetain"));
    private final SelenideElement maxMessageBytes = $(By.name("maxMessageBytes"));

    public TopicCreateEditSettingsView setTopicName(String topicName) {
        $("input#topicFormName").setValue(topicName);
        return this;
    }

    public TopicCreateEditSettingsView setMinInsyncReplicas(Integer minInsyncReplicas) {
        $("input[name=minInsyncReplicas]").setValue(minInsyncReplicas.toString());
        return this;
    }

    public TopicCreateEditSettingsView setTimeToRetainDataInMs(Long ms) {
        timeToRetain.setValue(ms.toString());
        return this;
    }

    public TopicCreateEditSettingsView setTimeToRetainDataInMs(String ms) {
        timeToRetain.setValue(ms);
        return this;
    }


    public TopicCreateEditSettingsView setMaxSizeOnDiskInGB(String value) {
        KafkaUISelectElement kafkaUISelectElement = new KafkaUISelectElement("retentionBytes");
        kafkaUISelectElement.selectByVisibleText(value);
        return this;
    }

    public TopicCreateEditSettingsView setMaxMessageBytes(Long bytes) {
        maxMessageBytes.setValue(bytes.toString());
        return this;
    }

    public TopicCreateEditSettingsView setMaxMessageBytes(String bytes) {
        return setMaxMessageBytes(Long.parseLong(bytes));
    }

    public TopicCreateEditSettingsView setTimeToRetainDataInMsUsingButtons(String value) {
        timeToRetain
                .parent()
                .parent()
                .$$("button")
                .find(Condition.exactText(value))
                .click();
        return this;
    }


    public TopicCreateEditSettingsView selectCleanupPolicy(CleanupPolicyValue cleanupPolicyValue) {
        return selectFromDropDownByOptionValue("cleanupPolicy",
                cleanupPolicyValue.getOptionValue());
    }

    public TopicCreateEditSettingsView selectCleanupPolicy(String cleanupPolicyOptionValue) {
        $("ul#topicFormCleanupPolicy").click();
        $x("//li[text()='" + cleanupPolicyOptionValue + "']").click();
        return this;
    }

    public TopicCreateEditSettingsView selectRetentionBytes(String visibleValue) {
        return selectFromDropDownByVisibleText("retentionBytes", visibleValue);
    }

    public TopicCreateEditSettingsView selectRetentionBytes(Long optionValue) {
        return selectFromDropDownByOptionValue("retentionBytes", optionValue.toString());
    }

    public TopicView sendData() {
        BrowserUtils.javaExecutorClick($(".ezTgzA.sc-bYEvvW"));
        return new TopicView();
    }

    public TopicCreateEditSettingsView addCustomParameter(String customParameterName,
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
        kafkaUISelectElement.selectByVisibleText(customParameterName);
        $("input[name=\"customParams.%d.value\"]".formatted(customParametersElements.size() - 1))
                .setValue(customParameterValue);
        return this;
    }

    public TopicCreateEditSettingsView updateCustomParameter(String customParameterName,
                                                             String customParameterValue) {
        SelenideElement selenideElement = $$("ul[role=listbox][name^=customParams][name$=name]")
                .find(Condition.exactText(customParameterName));
        String name = selenideElement.getAttribute("name");
        name = name.substring(0, name.lastIndexOf("."));
        $("input[name^=%s]".formatted(name)).setValue(customParameterValue);
        return this;
    }

    public TopicCreateEditSettingsView cleanupPolicyIs(String value) {
        String cleanupPolicy = new KafkaUISelectElement("cleanupPolicy")
                .getCurrentValue();
        assertThat(cleanupPolicy)
                .as("Clear policy value should be " + value)
                .isEqualToIgnoringCase(value);
        return this;
    }

    public TopicCreateEditSettingsView timeToRetainIs(String time) {
        String value = timeToRetain.getValue();
        assertThat(value)
                .as("Time to retain data (in ms) should be " + time)
                .isEqualTo(time);
        return this;
    }

    public TopicCreateEditSettingsView maxSizeOnDiskIs(String size) {
        String retentionBytes = new KafkaUISelectElement("retentionBytes")
                .getCurrentValue();
        assertThat(retentionBytes)
                .as("Max size on disk in GB should be " + size)
                .isEqualTo(size);
        return this;
    }

    public TopicCreateEditSettingsView maxMessageBytesIs(String bytes) {
        String value = maxMessageBytes.getValue();
        assertThat(value)
                .as("Maximum message size in bytes should be " + bytes)
                .isEqualTo(bytes);
        return this;
    }


    private static class KafkaUISelectElement {

        private SelenideElement selectElement;

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

    private TopicCreateEditSettingsView selectFromDropDownByOptionValue(String dropDownElementName,
                                                                        String optionValue) {
        KafkaUISelectElement select = new KafkaUISelectElement(dropDownElementName);
        select.selectByOptionValue(optionValue);
        return this;
    }

    private TopicCreateEditSettingsView selectFromDropDownByVisibleText(String dropDownElementName,
                                                                        String visibleText) {
        KafkaUISelectElement select = new KafkaUISelectElement(dropDownElementName);
        select.selectByVisibleText(visibleText);
        return this;
    }
}
