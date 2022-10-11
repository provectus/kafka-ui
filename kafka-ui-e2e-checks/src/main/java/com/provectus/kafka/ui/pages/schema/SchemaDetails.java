package com.provectus.kafka.ui.pages.schema;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;

import static com.codeborne.selenide.Selenide.$$x;
import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;

public class SchemaDetails {

    protected SelenideElement dotMenuBtn = $$x("//button[@aria-label='Dropdown Toggle']").first();
    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement actualVersionWindow = $x("//div[@id='schema']");
    protected SelenideElement compatibility = $x("//h4[contains(text(),'Compatibility')]/../p");
    protected SelenideElement editSchemaBtn = $x("//button[contains(text(),'Edit Schema')]");
    protected SelenideElement removeBtn = $x("//*[contains(text(),'Remove')]");
    protected SelenideElement confirmBtn = $x("//div[@role='dialog']//button[contains(text(),'Confirm')]");

    @Step
    public SchemaDetails waitUntilScreenReady() {
        loadingSpinner.shouldBe(Condition.disappear);
        actualVersionWindow.shouldBe(Condition.visible);
        return this;
    }

    @Step
    public String getCompatibility() {
        return compatibility.getText();
    }

    @Step
    public SchemaDetails openEditSchema(){
        editSchemaBtn.shouldBe(Condition.visible).click();
        return this;
    }

    @Step
    public SchemaRegistryList removeSchema() {
        clickByJavaScript(dotMenuBtn);
        removeBtn.shouldBe(Condition.visible).click();
        confirmBtn.shouldBe(Condition.enabled).click();
        confirmBtn.shouldBe(Condition.disappear);
        return new SchemaRegistryList();
    }
}
