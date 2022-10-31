package com.provectus.kafka.ui.pages.schema;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.api.model.CompatibilityLevel;
import com.provectus.kafka.ui.api.model.SchemaType;
import io.qameta.allure.Step;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.utilities.WebUtils.clearByKeyboard;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;

public class SchemaCreateForm {

    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement schemaNameField = $x("//input[@name='subject']");
    protected SelenideElement pageTitle = $x("//h1['Edit']");
    protected SelenideElement schemaTextArea = $x("//textarea[@name='schema']");
    protected SelenideElement submitBtn = $x("//button[@type='submit']");
    protected SelenideElement newSchemaInput = $("#newSchema [wrap]");
    protected SelenideElement schemaTypeDdl = $x("//ul[@name='schemaType']");
    protected SelenideElement compatibilityLevelList = $x("//ul[@name='compatibilityLevel']");
    protected SelenideElement newSchemaTextArea = $x("//div[@id='newSchema']");
    protected String elementLocatorDdl = "//li[@value='%s']";

    @Step
    public SchemaCreateForm waitUntilScreenReady(){
        loadingSpinner.shouldBe(Condition.disappear);
        pageTitle.shouldBe(Condition.visible);
        return this;
    }

    @Step
    public SchemaCreateForm setSubjectName(String name) {
        schemaNameField.setValue(name);
        return this;
    }

    @Step
    public SchemaCreateForm setSchemaField(String text) {
        schemaTextArea.setValue(text);
        return this;
    }

    @Step
    public SchemaCreateForm selectSchemaTypeFromDropdown(SchemaType schemaType) {
        schemaTypeDdl.shouldBe(Condition.enabled).click();
        $x(String.format(elementLocatorDdl, schemaType.getValue())).shouldBe(Condition.visible).click();
        return this;
    }

    @Step
    public SchemaCreateForm clickSubmitBtn() {
        clickByJavaScript(submitBtn);
        return this;
    }

    @Step
    public SchemaCreateForm selectCompatibilityLevelFromDropdown(CompatibilityLevel.CompatibilityEnum level) {
        compatibilityLevelList.shouldBe(Condition.enabled).click();
        $x(String.format(elementLocatorDdl, level.getValue())).shouldBe(Condition.visible).click();
        return this;
    }

    @Step
    public SchemaCreateForm setNewSchemaValue(String configJson) {
        newSchemaTextArea.shouldBe(Condition.visible).click();
        clearByKeyboard(newSchemaInput);
        newSchemaInput.setValue(configJson);
        return this;
    }

    @Step
    public boolean isSchemaDropDownDisabled(){
        boolean disabled = false;
        try{
            String attribute = schemaTypeDdl.getAttribute("disabled");
            disabled = true;
        }
        catch (Throwable ignored){
        }
        return disabled;
    }
}
