package com.provectus.kafka.ui.pages;

import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utilities.WebUtils;

public abstract class BasePage extends WebUtils {
    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement submitBtn = $x("//button[@type='submit']");
    protected SelenideElement tableGrid = $x("//table");
    protected SelenideElement dotMenuBtn = $x("//button[@aria-label='Dropdown Toggle']");

    public void waitUntilSpinnerDisappear(){
        if(isVisible(loadingSpinner))
            loadingSpinner.shouldBe(Condition.disappear);
    }

    public void clickSubmitButton(){
        clickByJavaScript(submitBtn);
    }
}
