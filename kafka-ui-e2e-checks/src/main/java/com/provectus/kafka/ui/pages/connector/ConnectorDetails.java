package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.sleep;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;
import static com.provectus.kafka.ui.utilities.screenshots.Screenshooter.log;

public class ConnectorDetails {
    protected SelenideElement dotMenuBtn = $(By.xpath("//button[@aria-label='Dropdown Toggle']"));
    protected SelenideElement deleteBtn = $(By.xpath("//li/div[text()='Delete']"));
    protected SelenideElement confirmBtnMdl = $(By.xpath("//div[@role='dialog']//button[text()='Confirm']"));
    protected SelenideElement submitBtn = $(By.xpath("//button[@type='submit']"));
    protected SelenideElement contentTextArea = $("[wrap]");

    @Step
    public ConnectorDetails waitUntilScreenReady() {
        $(By.xpath("//a[text() ='Tasks']")).shouldBe(Condition.visible);
        $(By.xpath("//a[text() ='Config']")).shouldBe(Condition.visible);
        return this;
    }

    @Step()
    public ConnectorDetails openConfigTab() {
        clickByJavaScript($(By.xpath("//a[text() ='Config']")));
        return this;
    }

    @Step()
    public ConnectorDetails setConfig(String configJson) {
        $("#config").click();
        contentTextArea.sendKeys(Keys.LEFT_CONTROL + "a");
        contentTextArea.setValue("");
        contentTextArea.setValue(String.valueOf(configJson.toCharArray()));
        $("#config").click();
        clickByJavaScript(submitBtn);
        sleep(4000);
        log.info("Connector config is submitted");
        return this;
    }

    @Step()
    public ConnectorDetails openDotMenu() {
        clickByJavaScript(dotMenuBtn);
        return this;
    }

    @Step()
    public ConnectorDetails clickDeleteButton() {
        clickByJavaScript(deleteBtn);
        return this;
    }

    @Step()
    public ConnectorDetails clickConfirmButton() {
        confirmBtnMdl.shouldBe(Condition.enabled).click();
        confirmBtnMdl.shouldBe(Condition.disappear);
        return this;
    }

    @Step()
    public ConnectorDetails deleteConnector() {
        openDotMenu();
        clickDeleteButton();
        clickConfirmButton();
        return this;
    }
}