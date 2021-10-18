

package com.provectus.kafka.ui.pages;


import com.codeborne.selenide.SelenideElement;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

import static com.codeborne.selenide.Selenide.$;

public class SchemaRegistry extends MainPage{
    private SelenideElement schemabutton = $(By.xpath("//*[contains(text(),'Create Schema')]"));
    private SelenideElement subjectname = $(By.xpath("//input[@name='subject']"));
    private SelenideElement schemafield = $(By.xpath("//textarea[@name='schema']"));
    private SelenideElement schemaTypeDropdown = $(By.xpath("//select[@name='schemaType']"));
    private SelenideElement submitSchema = $(By.xpath("//input[@type='submit']"));

    public SchemaRegistry selectFromDropdown(SchemaType option){
        Select schemaType = new Select(schemaTypeDropdown);
        schemaType.selectByVisibleText(option.getValue());
        return this;
    }

    public SchemaRegistry clickSubmit(){
        submitSchema.click();
        return new SchemaRegistry();
    }

    public SchemaRegistry setSubjectname(String name){
        subjectname.setValue(name);
        return this;
    }

    public SchemaRegistry setSchemafield(String text){
        schemafield.setValue(text);
        return this;
}

    public SchemaRegistry clickCreateschema(){
        schemabutton.click();
        return this;
    }


}












