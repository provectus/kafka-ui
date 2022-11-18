package com.provectus.kafka.ui.pages.schema;

import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;

public class SchemaDetails extends BasePage {

    protected SelenideElement actualVersionTextArea = $x("//div[@id='schema']");
    protected SelenideElement compatibilityField = $x("//h4[contains(text(),'Compatibility')]/../p");
    protected SelenideElement editSchemaBtn = $x("//button[contains(text(),'Edit Schema')]");
    protected SelenideElement removeBtn = $x("//*[contains(text(),'Remove')]");
    protected SelenideElement confirmBtn = $x("//div[@role='dialog']//button[contains(text(),'Confirm')]");
    protected SelenideElement schemaTypeField = $x("//h4[contains(text(),'Type')]/../p");
    protected SelenideElement latestVersionField = $x("//h4[contains(text(),'Latest version')]/../p");
    protected SelenideElement compareVersionBtn = $x("//button[text()='Compare Versions']");
    protected String schemaHeaderLocator = "//h1[contains(text(),'%s')]";

    @Step
    public SchemaDetails waitUntilScreenReady() {
        waitUntilSpinnerDisappear();
        actualVersionTextArea.shouldBe(Condition.visible);
        return this;
    }

    @Step
    public String getCompatibility() {
        return compatibilityField.getText();
    }

    @Step
    public boolean isSchemaHeaderVisible(String schemaName) {
        return isVisible($x(String.format(schemaHeaderLocator,schemaName)));
    }

    @Step
    public int getLatestVersion(){
      return Integer.parseInt(latestVersionField.getText());
    }

    @Step
    public String getSchemaType() {
        return schemaTypeField.getText();
    }

    @Step
    public SchemaDetails openEditSchema(){
        editSchemaBtn.shouldBe(Condition.visible).click();
        return this;
    }

    @Step
    public SchemaDetails openCompareVersionMenu(){
      compareVersionBtn.shouldBe(Condition.enabled).click();
      return this;
    }

    @Step
    public SchemaDetails removeSchema() {
        clickByJavaScript(dotMenuBtn);
        removeBtn.shouldBe(Condition.enabled).click();
        confirmBtn.shouldBe(Condition.visible).click();
        confirmBtn.shouldBe(Condition.disappear);
        return this;
    }
}
