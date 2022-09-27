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
import static com.provectus.kafka.ui.utilities.WebUtils.javaExecutorClick;

public class SchemaEditView {

    protected SelenideElement newSchemaTextArea = $("#newSchema [wrap]");
    protected SelenideElement schemaTypeDropDown = $x("//ul[@name='schemaType']");

    @Step
    public SchemaEditView selectSchemaTypeFromDropdown(SchemaType schemaType) {
        $x("//ul[@name='schemaType']").click();
        $x("//li[text()='" + schemaType.getValue() + "']").click();
        return this;
    }
    @Step
    public SchemaEditView selectCompatibilityLevelFromDropdown(CompatibilityLevel.CompatibilityEnum level) {
        $x("//ul[@name='compatibilityLevel']").click();
        $x("//li[text()='" + level.getValue() + "']").click();
        return this;
    }
    @Step
    public SchemaView clickSubmit() {
        javaExecutorClick($(By.xpath("//button[@type='submit']")));
        return new SchemaView();
    }

    @Step("Set new schema value")
    public SchemaEditView setNewSchemaValue(String configJson) {
        $("#newSchema").click();
        newSchemaTextArea.sendKeys(Keys.CONTROL + "a", Keys.BACK_SPACE);
        Selenide.executeJavaScript("arguments[0].value = '';", $("#newSchema"));
        newSchemaTextArea.setValue(configJson);
        return this;
    }

    @Step
    public SchemaRegistryList removeSchema() {
        $(By.xpath("//*[contains(text(),'Remove')]")).click();
        $(By.xpath("//*[text()='Confirm']")).shouldBe(Condition.visible).click();
        return new SchemaRegistryList();
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
