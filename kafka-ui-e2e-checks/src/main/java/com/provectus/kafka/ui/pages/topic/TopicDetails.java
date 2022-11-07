package com.provectus.kafka.ui.pages.topic;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utilities.WaitUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import java.util.Arrays;

import static com.codeborne.selenide.Selenide.*;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;
import static com.provectus.kafka.ui.utilities.WebUtils.isVisible;

@ExtensionMethod({WaitUtils.class})
public class TopicDetails {

    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement dotMenuBtn = $$x("//button[@aria-label='Dropdown Toggle']").first();
    protected SelenideElement dotPartitionIdMenuBtn = $(By.cssSelector("button.sc-hOqruk.eYtACj"));
    protected SelenideElement clearMessagesBtn = $x(("//div[contains(text(), 'Clear messages')]"));
    protected SelenideElement overviewTab = $x("//a[contains(text(),'Overview')]");
    protected SelenideElement messagesTab = $x("//a[contains(text(),'Messages')]");
    protected SelenideElement editSettingsTab = $x("//li[@role][contains(text(),'Edit settings')]");
    protected SelenideElement removeTopicBtn = $x("//ul[@role='menu']//div[contains(text(),'Remove Topic')]");
    protected SelenideElement confirmBtn = $x("//div[@role='dialog']//button[contains(text(),'Confirm')]");
    protected SelenideElement produceMessageBtn = $x("//div//button[text()='Produce Message']");
    protected SelenideElement contentMessageTab = $x("//html//div[@id='root']/div/main//table//p");
    protected SelenideElement cleanUpPolicyField = $x("//div[contains(text(),'Clean Up Policy')]/../span/*");
    protected SelenideElement partitionsField = $x("//div[contains(text(),'Partitions')]/../span");
    protected String consumerIdLocator = "//a[@title='%s']";
    protected String topicHeaderLocator = "//h1[contains(text(),'%s')]";

    @Step
    public TopicDetails waitUntilScreenReady() {
        loadingSpinner.shouldBe(Condition.disappear);
        Arrays.asList(overviewTab,messagesTab).forEach(element -> element.shouldBe(Condition.visible));
        return this;
    }

    @Step
    public TopicDetails openEditSettings() {
        clickByJavaScript(dotMenuBtn);
        editSettingsTab.shouldBe(Condition.visible).click();
        return this;
    }

    @Step
    public TopicDetails openTopicMenu(TopicMenu menu) {
        $(By.linkText(menu.getValue())).shouldBe(Condition.visible).click();
        return this;
    }

    @Step
    public TopicDetails openDotPartitionIdMenu() {
        dotPartitionIdMenuBtn.shouldBe(Condition.visible.because("dot menu invisible")).click();
        return this;
    }

    @Step
    public String getCleanUpPolicy(){
      return cleanUpPolicyField.getText();
    }

    @Step
    public String getPartitions(){
        return partitionsField.getText();
    }

    @Step
    public boolean isTopicHeaderVisible(String topicName) {
        return isVisible($x(String.format(topicHeaderLocator,topicName)));
    }

    @Step
    public TopicDetails clickClearMessagesBtn() {
        clearMessagesBtn.shouldBe(Condition.visible.because("Clear Messages invisible")).click();
        return this;
    }

    @Step
    public TopicDetails deleteTopic() {
        clickByJavaScript(dotMenuBtn);
        removeTopicBtn.shouldBe(Condition.visible).click();
        confirmBtn.shouldBe(Condition.enabled).click();
        confirmBtn.shouldBe(Condition.disappear);
        return this;
    }

    @Step
    public TopicDetails clickProduceMessageBtn() {
        clickByJavaScript(produceMessageBtn);
        return this;
    }
    @Step
    public TopicDetails openConsumerGroup(String consumerId) {
        $x(String.format(consumerIdLocator, consumerId)).click();
        return this;
    }

    @Step
    public boolean isKeyMessageVisible(String keyMessage) {
        return keyMessage.equals($("td[title]").getText());
    }

    @Step
    public boolean isContentMessageVisible(String contentMessage) {
        return contentMessage.matches(contentMessageTab.getText().trim());
    }

    @Step
    public String MessageCountAmount() {
        return $(By.xpath("//table[@class=\"sc-hiSbEG cvnuic\"]/tbody/tr/td[5]")).getText();
    }

    private enum DotMenuHeaderItems {
        EDIT_SETTINGS("Edit settings"),
        CLEAR_MESSAGES("Clear messages"),
        REMOVE_TOPIC("Remove topic");

        private final String value;

        DotMenuHeaderItems(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        @Override
        public String toString() {
            return "DotMenuHeaderItems{" + "value='" + value + '\'' + '}';
        }
    }

    public enum DotPartitionIdMenu {
        CLEAR_MESSAGES("Clear messages");


        private final String value;

        DotPartitionIdMenu(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        @Override
        public String toString() {
            return "DotPartitionIdMenuItems{" + "value='" + value + '\'' + '}';
        }
    }

    public enum TopicMenu {
        OVERVIEW("Overview"),
        MESSAGES("Messages"),
        CONSUMERS("Consumers"),
        SETTINGS("Settings");

        private final String value;

        TopicMenu(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        @Override
        public String toString() {
            return "TopicMenu{" + "value='" + value + '\'' + '}';
        }
    }
}
