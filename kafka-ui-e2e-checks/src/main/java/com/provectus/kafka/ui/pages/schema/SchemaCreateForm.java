package com.provectus.kafka.ui.pages.schema;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.api.model.CompatibilityLevel;
import com.provectus.kafka.ui.api.model.SchemaType;
import io.qameta.allure.Step;
import org.openqa.selenium.Keys;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;

public class SchemaCreateForm {

    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement subjectName = $x("//input[@name='subject']");
    protected SelenideElement titleElementLocator = $x("//h1['Edit']");
    protected SelenideElement schemaField = $x("//textarea[@name='schema']");
    protected SelenideElement submitSchemaButton = $x("//button[@type='submit']");
    protected SelenideElement newSchemaTextArea = $("#newSchema [wrap]");
    protected SelenideElement schemaTypeDropDown = $x("//ul[@name='schemaType']");
    protected SelenideElement schemaTypeList = $x("//ul[@role='listbox']");
    protected SelenideElement compatibilityLevelList = $x("//ul[@name='compatibilityLevel']");
    protected SelenideElement fieldNewSchema = $x("//div[@id='newSchema']");
    protected String ddlElementLocator = "//li[text()='%s']";

    @Step
    public SchemaCreateForm waitUntilScreenReady(){
        loadingSpinner.shouldBe(Condition.disappear);
        titleElementLocator.shouldBe(Condition.visible);
        return this;
    }

    @Step
    public SchemaCreateForm setSubjectName(String name) {
        subjectName.setValue(name);
        return this;
    }

    @Step
    public SchemaCreateForm setSchemaField(String text) {
        schemaField.setValue(text);
        return this;
    }

    @Step
    public SchemaCreateForm selectSchemaTypeFromDropdown(SchemaType schemaType) {
        schemaTypeList.shouldBe(Condition.enabled).click();
        $x(String.format(ddlElementLocator, schemaType.getValue())).shouldBe(Condition.visible).click();
        return this;
    }

    @Step
    public SchemaDetails clickSubmit() {
        clickByJavaScript(submitSchemaButton);
        return new SchemaDetails();
    }

    @Step
    public SchemaCreateForm selectCompatibilityLevelFromDropdown(CompatibilityLevel.CompatibilityEnum level) {
        compatibilityLevelList.shouldBe(Condition.enabled).click();
        $x(String.format(ddlElementLocator, level.getValue())).shouldBe(Condition.visible).click();
        return this;
    }

    @Step("Set new schema value")
    public SchemaCreateForm setNewSchemaValue(String configJson) {
        fieldNewSchema.shouldBe(Condition.visible).click();
        newSchemaTextArea.sendKeys(Keys.CONTROL + "a", Keys.BACK_SPACE);
        Selenide.executeJavaScript("arguments[0].value = '';", $("#newSchema"));
        newSchemaTextArea.setValue(configJson);
        return this;
    }

    @Step
    public boolean isSchemaDropDownDisabled(){
        boolean disabled = false;
        try{
            String attribute = schemaTypeDropDown.getAttribute("disabled");
            disabled = true;
        }
        catch (Throwable ignored){
        }
        return disabled;
    }
}
