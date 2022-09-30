package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utilities.WaitUtils;
import com.provectus.kafka.ui.settings.Source;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;

@ExtensionMethod({WaitUtils.class})
public class MainPage {

    private static final String path = "/";

    @Step
    public MainPage goTo() {
        Selenide.open(Source.BASE_WEB_URL + path);
        return this;
    }

    @Step
    public MainPage waitUntilScreenReady() {
        $(By.xpath("//*[contains(text(),'Loading')]")).shouldBe(Condition.disappear);
        $("input[name=switchRoundedDefault]").parent().$("span").shouldBe(Condition.visible);
        return this;
    }

//    public enum SideMenuOptions {
//        BROKERS("Brokers"),
//        TOPICS("Topics"),
//        CONSUMERS("Consumers"),
//        SCHEMA_REGISTRY("Schema Registry");
//
//        final String value;
//
//        SideMenuOptions(String value) {
//            this.value = value;
//        }
//    }

//    @Step
//    public MainPage goToSideMenu(String clusterName, SideMenuOptions option) {
//        SelenideElement clusterElement = $x(String.format("//aside/ul/li[contains(.,'%s')]", clusterName)).shouldBe(Condition.visible);
//        if (clusterElement.parent().$$x(".//ul").size() == 0) {
//            clusterElement.click();
//        }
//        clusterElement
//                .parent()
//                .$x(String.format(".//ul/li[contains(.,'%s')]", option.value))
//                .click();
//        return this;
//    }
}
