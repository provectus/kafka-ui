package com.provectus.kafka.ui.pages.schema;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$x;
import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.api.model.CompatibilityLevel;
import com.provectus.kafka.ui.api.model.SchemaType;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class SchemaCreateForm extends BasePage {

    protected SelenideElement schemaNameField = $x("//input[@name='subject']");
    protected SelenideElement pageTitle = $x("//h1['Edit']");
    protected SelenideElement schemaTextArea = $x("//textarea[@name='schema']");
    protected SelenideElement newSchemaInput = $("#newSchema [wrap]");
    protected SelenideElement schemaTypeDdl = $x("//ul[@name='schemaType']");
    protected SelenideElement compatibilityLevelList = $x("//ul[@name='compatibilityLevel']");
    protected SelenideElement newSchemaTextArea = $x("//div[@id='newSchema']");
    protected SelenideElement latestSchemaTextArea = $x("//div[@id='latestSchema']");
    protected SelenideElement schemaVersionDdl = $$x("//ul[@role='listbox']/li[text()='Version 2']").first();
    protected List<SelenideElement> visibleMarkers = $$x("//div[@class='ace_scroller']//div[contains(@class,'codeMarker')]");
    protected List<SelenideElement> elementsCompareVersionDdl = $$x("//ul[@role='listbox']/ul/li");
    protected String ddlElementLocator = "//li[@value='%s']";

    @Step
    public SchemaCreateForm waitUntilScreenReady(){
        waitUntilSpinnerDisappear();
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
        $x(String.format(ddlElementLocator, schemaType.getValue())).shouldBe(Condition.visible).click();
        return this;
    }

    @Step
    public SchemaCreateForm clickSubmitButton() {
        clickSubmitBtn();
        return this;
    }

    @Step
    public SchemaCreateForm selectCompatibilityLevelFromDropdown(CompatibilityLevel.CompatibilityEnum level) {
        compatibilityLevelList.shouldBe(Condition.enabled).click();
        $x(String.format(ddlElementLocator, level.getValue())).shouldBe(Condition.visible).click();
        return this;
    }

    @Step
    public SchemaCreateForm openSchemaVersionDdl(){
      schemaVersionDdl.shouldBe(Condition.enabled).click();
      return this;
    }

    @Step
    public int getVersionsNumberFromList(){
      return elementsCompareVersionDdl.size();
    }

    @Step
    public SchemaCreateForm selectVersionFromDropDown(int versionNumberDd){
      $x(String.format(ddlElementLocator,versionNumberDd)).shouldBe(Condition.visible).click();
      return this;
    }

    @Step
    public int getMarkedLinesNumber(){
      return visibleMarkers.size();
    }

    @Step
    public SchemaCreateForm setNewSchemaValue(String configJson) {
        newSchemaTextArea.shouldBe(Condition.visible).click();
        clearByKeyboard(newSchemaInput);
        newSchemaInput.setValue(configJson);
        return this;
    }

    @Step
    public List<SelenideElement> getAllDetailsPageElements() {
      return Stream.of(compatibilityLevelList, newSchemaTextArea, latestSchemaTextArea, submitBtn, schemaTypeDdl)
          .collect(Collectors.toList());
    }

    @Step
    public boolean isSubmitBtnEnabled(){
      return isEnabled(submitBtn);
    }

    @Step
    public boolean isSchemaDropDownEnabled(){
        boolean enabled = true;
        try{
            String attribute = schemaTypeDdl.getAttribute("disabled");
            enabled = false;
        }
        catch (Throwable ignored){
        }
        return enabled;
    }
}
