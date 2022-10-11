package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;
import org.openqa.selenium.Keys;

import java.util.ArrayList;
import java.util.List;

import static com.codeborne.selenide.Selenide.$x;
import static com.codeborne.selenide.Selenide.sleep;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;
import static com.provectus.kafka.ui.utilities.screenshots.Screenshooter.log;

public class ConnectorDetails {

    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement dotMenuBtn = $x("//button[@aria-label='Dropdown Toggle']");
    protected SelenideElement deleteBtn = $x("//li/div[contains(text(),'Delete')]");
    protected SelenideElement confirmBtnMdl = $x("//div[@role='dialog']//button[contains(text(),'Confirm')]");
    protected SelenideElement submitBtn = $x("//button[@type='submit']");
    protected SelenideElement contentTextArea = $x("//textarea[@class='ace_text-input']");
    protected SelenideElement taskTab = $x("//a[contains(text(),'Tasks')]");
    protected SelenideElement configTab = $x("//a[contains(text(),'Config')]");
    protected SelenideElement overviewTab = $x("//a[contains(text(),'Overview')]");
    protected SelenideElement configField = $x("//div[@id='config']");
    protected List<SelenideElement> navigationElements = new ArrayList<>();

    @Step
    public ConnectorDetails waitUntilScreenReady() {
        loadingSpinner.shouldBe(Condition.disappear);
        navigationElements.addAll(List.of(taskTab, configTab, overviewTab));
        navigationElements.forEach(elementsMenu -> elementsMenu.shouldBe(Condition.visible));
        return this;
    }

    @Step()
    public ConnectorDetails openConfigTab() {
        clickByJavaScript(configTab);
        return this;
    }

    @Step()
    public ConnectorDetails setConfig(String configJson) {
        configField.shouldBe(Condition.visible).click();
        contentTextArea.sendKeys(Keys.LEFT_CONTROL + "a");
        contentTextArea.setValue("");
        contentTextArea.setValue(String.valueOf(configJson.toCharArray()));
        configField.shouldBe(Condition.visible).click();
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