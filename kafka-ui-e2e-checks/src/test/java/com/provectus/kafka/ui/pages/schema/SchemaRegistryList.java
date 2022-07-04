package com.provectus.kafka.ui.pages.schema;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utils.BrowserUtils;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;

public class SchemaRegistryList {

    private SelenideElement schemaButton = $(By.xpath("//*[contains(text(),'Create Schema')]"));

    public SchemaCreateView clickCreateSchema() {
        BrowserUtils.javaExecutorClick(schemaButton);
        return new SchemaCreateView();
    }

    public SchemaView openSchema(String schemaName) {
        $(By.xpath("//*[contains(text(),'" + schemaName + "')]")).click();
        return new SchemaView();
    }

    @SneakyThrows
    public SchemaRegistryList isNotVisible(String schemaName) {
        $x(String.format("//*[contains(text(),'%s')]",schemaName)).shouldNotBe(Condition.visible);
        return this;
    }

    @Step
    public SchemaRegistryList isSchemaVisible(String schemaName) {
        $$("tbody td>a")
                .find(Condition.exactText(schemaName))
                .shouldBe(Condition.visible);
        return this;
    }
}

