package com.provectus.kafka.ui.pages.topic;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.base.TestConfiguration;
import com.provectus.kafka.ui.extensions.WaitUtils;
import com.provectus.kafka.ui.utils.BrowserUtils;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import static com.codeborne.selenide.Selectors.byLinkText;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;

@ExtensionMethod({WaitUtils.class})
public class TopicView {

    private static final String path = "/ui/clusters/%s/topics/%s";
    private final SelenideElement dotMenuHeader = $(".fPWftu.sc-fHYyUA > .dropdown.is-right");
    private final SelenideElement dotMenuFooter = $$(".dropdown.is-right button").get(1);

    @Step
    public TopicView goTo(String cluster, String topic) {
        Selenide.open(TestConfiguration.BASE_WEB_URL + String.format(path, cluster, topic));
        return this;
    }

    @Step
    public TopicsList isOnTopicViewPage() {
       $("nav[role=navigation] a.is-active.is-primary").shouldBe(Condition.visible);
        return new TopicsList();
    }

    @SneakyThrows
    public TopicEditSettingsView openEditSettings(WebDriver driver) {
        dotMenuHeader.click();
        BrowserUtils.javaExecutorClick(driver,
                driver.findElement(By.xpath("//a[text()= '" + DotMenuHeaderItems.EDIT_SETTINGS.getValue() +"']")));
        return new TopicEditSettingsView();
    }


    @SneakyThrows
    public TopicView deleteTopic() {
        dotMenuHeader.click();
        $("#dropdown-menu").$(byLinkText(DotMenuHeaderItems.REMOVE_TOPIC.getValue())).click();
        $$("div[role=\"dialog\"] button").find(Condition.exactText("Submit")).click();
        return new TopicView();
    }

    private enum DotMenuHeaderItems {
        EDIT_SETTINGS("Edit settings"),
        CLEAR_MESSAGES("Clear messages"),
        REMOVE_TOPIC("Remove topic");

        private String value;

        DotMenuHeaderItems(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        @Override
        public String toString() {
            return "DotMenuHeaderItems{" +
                    "value='" + value + '\'' +
                    '}';
        }
    }
}