package com.provectus.kafka.ui.pages.schema;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;

import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;
import static com.provectus.kafka.ui.utilities.WebUtils.isVisible;

public class SchemaRegistryList {

    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement createSchemaBtn = $x("//button[contains(text(),'Create Schema')]");
    protected SelenideElement schemaGrid = $x("//table");
    protected String schemaElementLocator = "//a[contains(text(),'%s')]";

    @Step
    public SchemaRegistryList waitUntilScreenReady(){
        loadingSpinner.shouldBe(Condition.disappear);
        createSchemaBtn.shouldBe(Condition.visible);
        return this;
    }

    @Step
    public SchemaCreateForm clickCreateSchema() {
        clickByJavaScript(createSchemaBtn);
        return new SchemaCreateForm();
    }

    @Step
    public SchemaDetails openSchema(String schemaName) {
        $x(String.format(schemaElementLocator,schemaName)).shouldBe(Condition.visible).click();
        return new SchemaDetails();
    }

    @Step
    public boolean isSchemaVisible(String schemaName) {
        schemaGrid.shouldBe(Condition.visible);
        return isVisible($x(String.format(schemaElementLocator,schemaName)));
    }
}


