package com.provectus.kafka.ui.pages.topic;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utilities.WaitUtils;
import com.provectus.kafka.ui.settings.Source;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;
import static com.provectus.kafka.ui.utilities.WebUtils.javaExecutorClick;

@ExtensionMethod({WaitUtils.class})
public class TopicView {

    private static final String URL_PATH = "/ui/clusters/%s/topics/%s";
    protected SelenideElement dotMenuBtn = $$x("//button[@aria-label='Dropdown Toggle']").first();

    @Step
    public TopicView goTo(String cluster, String topic) {
        Selenide.open(Source.BASE_WEB_URL + String.format(URL_PATH, cluster, topic));
        return this;
    }

    @Step
    public TopicView waitUntilScreenReady() {
        $(By.linkText("Overview")).shouldBe(Condition.visible);
        return this;
    }

    @Step
    public TopicCreateEditSettingsView openEditSettings() {
        javaExecutorClick(dotMenuBtn);
        $x("//li[@role][text()='Edit settings']").click();
        return new TopicCreateEditSettingsView();
    }

    @Step
    public TopicView openTopicMenu(TopicMenu menu) {
        $(By.linkText(menu.getValue())).shouldBe(Condition.visible).click();
        return this;
    }

    @Step
    public TopicsList deleteTopic() {
        javaExecutorClick(dotMenuBtn);
        $x("//ul[@role='menu']//div[text()='Remove Topic']").click();
        SelenideElement confirmButton = $x("//div[@role=\"dialog\"]//button[text()='Confirm']");
        confirmButton.shouldBe(Condition.enabled).click();
        confirmButton.shouldBe(Condition.disappear);
        return new TopicsList();
    }

    @Step
    public ProduceMessagePanel clickOnButton(String buttonName) {
        javaExecutorClick($(By.xpath(String.format("//div//button[text()='%s']", buttonName))));
        return new ProduceMessagePanel();
    }

    @Step
    public boolean isKeyMessageVisible(String keyMessage) {
        return keyMessage.equals($("td[title]").getText());
    }

    @Step
    public boolean isContentMessageVisible(String contentMessage) {
        return contentMessage.matches($x("//html//div[@id='root']/div/main//table//p").getText().trim());
    }

    private enum DotMenuHeaderItems {
        EDIT_SETTINGS("Edit settings"), CLEAR_MESSAGES("Clear messages"), REMOVE_TOPIC("Remove topic");

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

    public enum TopicMenu {
        OVERVIEW("Overview"), MESSAGES("Messages"), CONSUMERS("Consumers"), SETTINGS("Settings");

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