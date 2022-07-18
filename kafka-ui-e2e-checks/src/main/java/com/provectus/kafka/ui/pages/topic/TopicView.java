package com.provectus.kafka.ui.pages.topic;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.helpers.TestConfiguration;
import com.provectus.kafka.ui.extensions.WaitUtils;
import com.provectus.kafka.ui.pages.ProduceMessagePage;
import com.provectus.kafka.ui.utils.BrowserUtils;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selectors.byLinkText;
import static com.codeborne.selenide.Selenide.*;

@ExtensionMethod({WaitUtils.class})
public class TopicView {

    private static final String path = "/ui/clusters/%s/topics/%s";
    private final SelenideElement dotMenuHeader = $$(".dropdown.is-right button").first();
    private final SelenideElement dotMenuFooter = $$(".dropdown.is-right button").get(1);

    @Step
    public TopicView goTo(String cluster, String topic) {
        Selenide.open(TestConfiguration.BASE_WEB_URL + String.format(path, cluster, topic));
        return this;
    }

    @Step
    public TopicView isOnTopicViewPage() {
        $(By.linkText("Overview")).shouldBe(Condition.visible);
        return this;
    }

    @SneakyThrows
    public TopicCreateEditSettingsView openEditSettings() {
        BrowserUtils.javaExecutorClick(dotMenuHeader);
        $x("//a[text()= '" + DotMenuHeaderItems.EDIT_SETTINGS.getValue() + "']").click();
        return new TopicCreateEditSettingsView();
    }

    @Step
    public TopicView openTopicMenu(TopicMenu menu) {
        $(By.linkText(menu.getValue())).shouldBe(Condition.visible).click();
        return this;
    }

    @SneakyThrows
    public TopicsList deleteTopic() {
        BrowserUtils.javaExecutorClick(dotMenuHeader);
        $("#dropdown-menu").$(byLinkText(DotMenuHeaderItems.REMOVE_TOPIC.getValue())).click();
        $$("div[role=\"dialog\"] button").find(Condition.exactText("Submit")).click();
        return new TopicsList();
    }

    @SneakyThrows
    public ProduceMessagePage clickOnButton(String buttonName) {
        BrowserUtils.javaExecutorClick($(By.xpath(String.format("//div//button[text()='%s']", buttonName))));
        return new ProduceMessagePage();
    }

    public boolean isKeyMessageVisible(String keyMessage) {
        return keyMessage.equals($("td[title]").getText());
    }

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