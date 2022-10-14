package com.provectus.kafka.ui.pages.schema;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.api.model.CompatibilityLevel;
import com.provectus.kafka.ui.api.model.SchemaType;
import io.qameta.allure.Step;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;

public class SchemaCreateForm {

    protected SelenideElement subjectName = $(By.xpath("//input[@name='subject']"));
    protected SelenideElement schemaField = $(By.xpath("//textarea[@name='schema']"));
    protected SelenideElement submitSchemaButton = $(By.xpath("//button[@type='submit']"));
    protected SelenideElement newSchemaTextArea = $("#newSchema [wrap]");
    protected SelenideElement schemaTypeDropDown = $x("//ul[@name='schemaType']");

    @Step
    public SchemaCreateForm waitUntilScreenReady() {
        $x("//h1['Edit']").shouldBe(Condition.visible);
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
        $("ul[role='listbox']").click();
        $x("//li[text()='" + schemaType.getValue() + "']").click();
        return this;
    }

    @Step
    public SchemaDetails clickSubmit() {
        clickByJavaScript(submitSchemaButton);
        return new SchemaDetails();
    }

    @Step
    public SchemaCreateForm selectCompatibilityLevelFromDropdown(CompatibilityLevel.CompatibilityEnum level) {
        $x("//ul[@name='compatibilityLevel']").click();
        $x("//li[text()='" + level.getValue() + "']").click();
        return this;
    }

    @Step("Set new schema value")
    public SchemaCreateForm setNewSchemaValue(String configJson) {
        $("#newSchema").click();
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
