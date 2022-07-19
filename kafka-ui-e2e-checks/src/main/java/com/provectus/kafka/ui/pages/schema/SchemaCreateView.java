package com.provectus.kafka.ui.pages.schema;

import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utils.BrowserUtils;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;

public class SchemaCreateView {

    private final SelenideElement subjectName = $(By.xpath("//input[@name='subject']"));
    private final SelenideElement schemaField = $(By.xpath("//textarea[@name='schema']"));
    private final SelenideElement submitSchemaButton = $(By.xpath("//button[@type='submit']"));

    public SchemaCreateView selectSchemaTypeFromDropdown(SchemaType schemaType) {
        $("ul[role='listbox']").click();
        $x("//li[text()='" + schemaType.getValue() + "']").click();
        return this;
    }

    public SchemaView clickSubmit() {
        BrowserUtils.javaExecutorClick(submitSchemaButton);
        return new SchemaView();
    }

    public SchemaCreateView setSubjectName(String name) {
        subjectName.setValue(name);
        return this;
    }

    public SchemaCreateView setSchemaField(String text) {
        schemaField.setValue(text);
        return this;
    }

    public enum SchemaType {
        AVRO("AVRO"),
        JSON("JSON"),
        PROTOBUF("PROTOBUF");

        final String value;

        SchemaType(String value) {
            this.value = value;
        }
        public String getValue(){
            return value;
        }
    }
}
