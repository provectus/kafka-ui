package com.provectus.kafka.ui.pages;

import static com.codeborne.selenide.Selenide.$$x;
import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.WebDriverRunner;
import com.provectus.kafka.ui.pages.panels.enums.MenuItem;
import com.provectus.kafka.ui.utilities.WebUtils;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;

@Slf4j
public abstract class BasePage extends WebUtils {

  protected SelenideElement loadingSpinner = $x("//div[@role='progressbar']");
  protected SelenideElement submitBtn = $x("//button[@type='submit']");
  protected SelenideElement tableGrid = $x("//table");
  protected SelenideElement searchFld = $x("//input[@type='text'][contains(@id, ':r')]");
  protected SelenideElement dotMenuBtn = $x("//button[@aria-label='Dropdown Toggle']");
  protected SelenideElement alertHeader = $x("//div[@role='alert']//div[@role='heading']");
  protected SelenideElement alertMessage = $x("//div[@role='alert']//div[@role='contentinfo']");
  protected SelenideElement confirmationMdl = $x("//div[text()= 'Confirm the action']/..");
  protected SelenideElement confirmBtn = $x("//button[contains(text(),'Confirm')]");
  protected SelenideElement cancelBtn = $x("//button[contains(text(),'Cancel')]");
  protected SelenideElement backBtn = $x("//button[contains(text(),'Back')]");
  protected SelenideElement previousBtn = $x("//button[contains(text(),'Previous')]");
  protected SelenideElement nextBtn = $x("//button[contains(text(),'Next')]");
  protected ElementsCollection ddlOptions = $$x("//li[@value]");
  protected ElementsCollection gridItems = $$x("//tr[@class]");
  protected String summaryCellLocator = "//div[contains(text(),'%s')]";
  protected String tableElementNameLocator = "//tbody//a[contains(text(),'%s')]";
  protected String columnHeaderLocator = "//table//tr/th//div[text()='%s']";
  protected String pageTitleFromHeader = "//h1[text()='%s']";
  protected String pagePathFromHeader = "//a[text()='%s']/../h1";

  protected boolean isSpinnerVisible(int... timeoutInSeconds) {
    return isVisible(loadingSpinner, timeoutInSeconds);
  }

  protected void waitUntilSpinnerDisappear(int... timeoutInSeconds) {
    log.debug("\nwaitUntilSpinnerDisappear");
    if (isSpinnerVisible(timeoutInSeconds)) {
      loadingSpinner.shouldBe(Condition.disappear, Duration.ofSeconds(60));
    }
  }

  protected void searchItem(String tag) {
    log.debug("\nsearchItem: {}", tag);
    sendKeysAfterClear(searchFld, tag);
    searchFld.pressEnter().shouldHave(Condition.value(tag));
    waitUntilSpinnerDisappear(1);
  }

  protected SelenideElement getPageTitleFromHeader(MenuItem menuItem) {
    return $x(String.format(pageTitleFromHeader, menuItem.getPageTitle()));
  }

  protected SelenideElement getPagePathFromHeader(MenuItem menuItem) {
    return $x(String.format(pagePathFromHeader, menuItem.getPageTitle()));
  }

  protected void clickSubmitBtn() {
    clickByJavaScript(submitBtn);
  }

  protected void clickNextBtn() {
    clickByJavaScript(nextBtn);
  }

  protected void clickBackBtn() {
    clickByJavaScript(backBtn);
  }

  protected void clickPreviousBtn() {
    clickByJavaScript(previousBtn);
  }

  protected void setJsonInputValue(SelenideElement jsonInput, String jsonConfig) {
    sendKeysByActions(jsonInput, jsonConfig.replace("  ", ""));
    new Actions(WebDriverRunner.getWebDriver())
        .keyDown(Keys.SHIFT)
        .sendKeys(Keys.PAGE_DOWN)
        .keyUp(Keys.SHIFT)
        .sendKeys(Keys.DELETE)
        .perform();
  }

  protected SelenideElement getTableElement(String elementName) {
    log.debug("\ngetTableElement: {}", elementName);
    return $x(String.format(tableElementNameLocator, elementName));
  }

  protected ElementsCollection getDdlOptions() {
    return ddlOptions;
  }

  protected String getAlertHeader() {
    log.debug("\ngetAlertHeader");
    String result = alertHeader.shouldBe(Condition.visible).getText();
    log.debug("-> {}", result);
    return result;
  }

  protected String getAlertMessage() {
    log.debug("\ngetAlertMessage");
    String result = alertMessage.shouldBe(Condition.visible).getText();
    log.debug("-> {}", result);
    return result;
  }

  protected boolean isAlertVisible(AlertHeader header) {
    log.debug("\nisAlertVisible: {}", header.toString());
    boolean result = getAlertHeader().equals(header.toString());
    log.debug("-> {}", result);
    return result;
  }

  protected boolean isAlertVisible(AlertHeader header, String message) {
    log.debug("\nisAlertVisible: {} {}", header, message);
    boolean result = isAlertVisible(header) && getAlertMessage().equals(message);
    log.debug("-> {}", result);
    return result;
  }

  protected void clickConfirmButton() {
    confirmBtn.shouldBe(Condition.enabled).click();
    confirmBtn.shouldBe(Condition.disappear);
  }

  protected void clickCancelButton() {
    cancelBtn.shouldBe(Condition.enabled).click();
    cancelBtn.shouldBe(Condition.disappear);
  }

  protected boolean isConfirmationModalVisible() {
    return isVisible(confirmationMdl);
  }

  public enum AlertHeader {
    SUCCESS("Success"),
    VALIDATION_ERROR("Validation Error"),
    BAD_REQUEST("400 Bad Request");

    private final String value;

    AlertHeader(String value) {
      this.value = value;
    }

    public String toString() {
      return value;
    }
  }
}
