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
    protected String schemaTabElementLocator = "//a[contains(text(),'%s')]";

    @Step
    public SchemaRegistryList waitUntilScreenReady(){
        loadingSpinner.shouldBe(Condition.disappear);
        createSchemaBtn.shouldBe(Condition.visible);
        return this;
    }

    @Step
    public SchemaRegistryList clickCreateSchema() {
        clickByJavaScript(createSchemaBtn);
        return this;
    }

    @Step
    public SchemaRegistryList openSchema(String schemaName) {
        $x(String.format(schemaTabElementLocator,schemaName))
                .shouldBe(Condition.enabled).click();
        return this;
    }

    @Step
    public boolean isSchemaVisible(String schemaName) {
        schemaGrid.shouldBe(Condition.visible);
        return isVisible($x(String.format(schemaTabElementLocator,schemaName)));
    }
}


