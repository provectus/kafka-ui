package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.settings.Source;
import com.provectus.kafka.ui.utilities.WaitUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;

import static com.codeborne.selenide.Selenide.*;
import static com.provectus.kafka.ui.utilities.WebUtils.javaExecutorClick;
import static com.provectus.kafka.ui.utilities.screenshots.Screenshooter.log;

@ExtensionMethod(WaitUtils.class)
public class ConnectorsView {
    private static final String path = "/ui/clusters/%s/connects/first/connectors/%s";
    protected SelenideElement submitButton = $(By.xpath("//button[@type='submit']"));
    protected SelenideElement contentTextArea = $("[wrap]");

    @Step
    public ConnectorsView goTo(String cluster, String connector) {
        Selenide.open(String.format(Source.BASE_WEB_URL + path, cluster, connector));
        return this;
    }

    @Step()
    public ConnectorsView openConfigTab() {
        javaExecutorClick($(By.xpath("//a[text() ='Config']")));
        return new ConnectorsView();
    }

    @Step("Set connector config JSON")
    public ConnectorsView setConfig(String configJson) {
        $("#config").click();
        contentTextArea.sendKeys(Keys.LEFT_CONTROL+"a");
        contentTextArea.setValue("");
        contentTextArea.setValue(String.valueOf(configJson.toCharArray()));
        $("#config").click();
        submitButton.shouldBe(Condition.enabled);
        javaExecutorClick(submitButton);
        sleep(4000);
        log.info("Connector config is submitted");
        return new ConnectorsView();
    }

    @Step("Click 'Delete' button")
    public void clickDeleteButton() {
        javaExecutorClick($x("//button[text()='Delete']"));
        SelenideElement confirmButton = $x("//div[@role=\"dialog\"]//button[text()='Confirm']");
        confirmButton.shouldBe(Condition.enabled).click();
        confirmButton.shouldBe(Condition.disappear);
    }

    @Step
    public ConnectorsView waitUntilScreenReady() {
        $(By.xpath("//a[text() ='Tasks']")).shouldBe(Condition.visible);
        $(By.xpath("//a[text() ='Config']")).shouldBe(Condition.visible);
        $(By.xpath("//a[text() ='Overview']")).shouldBe(Condition.visible);
        return this;
    }
}
