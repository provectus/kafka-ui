package com.provectus.kafka.ui.pages.topics;

import static com.codeborne.selenide.Selenide.$$x;
import static com.codeborne.selenide.Selenide.$x;
import static com.codeborne.selenide.Selenide.sleep;
import static com.provectus.kafka.ui.pages.topics.TopicDetails.TopicMenu.OVERVIEW;
import static org.testcontainers.shaded.org.apache.commons.lang3.RandomUtils.nextInt;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import io.qameta.allure.Step;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

public class TopicDetails extends BasePage {

  protected SelenideElement clearMessagesBtn = $x(("//div[contains(text(), 'Clear messages')]"));
  protected SelenideElement recreateTopicBtn = $x("//div[text()='Recreate Topic']");
  protected SelenideElement messageAmountCell = $x("//tbody/tr/td[5]");
  protected SelenideElement overviewTab = $x("//a[contains(text(),'Overview')]");
  protected SelenideElement messagesTab = $x("//a[contains(text(),'Messages')]");
  protected SelenideElement seekTypeDdl = $x("//ul[@id='selectSeekType']//li");
  protected SelenideElement seekTypeField = $x("//label[text()='Seek Type']//..//div/input");
  protected SelenideElement addFiltersBtn = $x("//button[text()='Add Filters']");
  protected SelenideElement savedFiltersLink = $x("//div[text()='Saved Filters']");
  protected SelenideElement addFilterCodeModalTitle = $x("//label[text()='Filter code']");
  protected SelenideElement addFilterCodeEditor = $x("//div[@id='ace-editor']");
  protected SelenideElement addFilterCodeTextarea = $x("//div[@id='ace-editor']//textarea");
  protected SelenideElement saveThisFilterCheckBoxAddFilterMdl = $x("//input[@name='saveFilter']");
  protected SelenideElement displayNameInputAddFilterMdl = $x("//input[@placeholder='Enter Name']");
  protected SelenideElement cancelBtnAddFilterMdl = $x("//button[text()='Cancel']");
  protected SelenideElement addFilterBtnAddFilterMdl = $x("//button[text()='Add filter']");
  protected SelenideElement saveFilterBtnEditFilterMdl = $x("//button[text()='Save']");
  protected SelenideElement addFiltersBtnMessages = $x("//button[text()='Add Filters']");
  protected SelenideElement selectFilterBtnAddFilterMdl = $x("//button[text()='Select filter']");
  protected SelenideElement editSettingsMenu = $x("//li[@role][contains(text(),'Edit settings')]");
  protected SelenideElement removeTopicBtn = $x("//ul[@role='menu']//div[contains(text(),'Remove Topic')]");
  protected SelenideElement produceMessageBtn = $x("//div//button[text()='Produce Message']");
  protected SelenideElement contentMessageTab = $x("//html//div[@id='root']/div/main//table//p");
  protected SelenideElement cleanUpPolicyField = $x("//div[contains(text(),'Clean Up Policy')]/../span/*");
  protected SelenideElement partitionsField = $x("//div[contains(text(),'Partitions')]/../span");
  protected SelenideElement backToCreateFiltersLink = $x("//div[text()='Back To create filters']");
  protected ElementsCollection messageGridItems = $$x("//tbody//tr");
  protected SelenideElement actualCalendarDate = $x("//div[@class='react-datepicker__current-month']");
  protected SelenideElement previousMonthButton = $x("//button[@aria-label='Previous Month']");
  protected SelenideElement nextMonthButton = $x("//button[@aria-label='Next Month']");
  protected SelenideElement calendarTimeFld = $x("//input[@placeholder='Time']");
  protected String detailsTabLtr = "//nav//a[contains(text(),'%s')]";
  protected String dayCellLtr = "//div[@role='option'][contains(text(),'%d')]";
  protected String seekFilterDdlLocator = "//ul[@id='selectSeekType']/ul/li[text()='%s']";
  protected String savedFilterNameLocator = "//div[@role='savedFilter']/div[contains(text(),'%s')]";
  protected String consumerIdLocator = "//a[@title='%s']";
  protected String topicHeaderLocator = "//h1[contains(text(),'%s')]";
  protected String activeFilterNameLocator = "//div[@data-testid='activeSmartFilter']/div[1][contains(text(),'%s')]";
  protected String editActiveFilterBtnLocator = "//div[text()='%s']/../div[@data-testid='editActiveSmartFilterBtn']";
  protected String settingsGridValueLocator = "//tbody/tr/td/span[text()='%s']//ancestor::tr/td[2]/span";

  @Step
  public TopicDetails waitUntilScreenReady() {
    waitUntilSpinnerDisappear();
    $x(String.format(detailsTabLtr, OVERVIEW)).shouldBe(Condition.visible);
    return this;
  }

  @Step
  public TopicDetails openDetailsTab(TopicMenu menu) {
    $x(String.format(detailsTabLtr, menu.toString())).shouldBe(Condition.enabled).click();
    waitUntilSpinnerDisappear();
    return this;
  }

  @Step
  public String getSettingsGridValueByKey(String key) {
    return $x(String.format(settingsGridValueLocator, key)).scrollTo().shouldBe(Condition.visible).getText();
  }

  @Step
  public TopicDetails openDotMenu() {
    clickByJavaScript(dotMenuBtn);
    return this;
  }

  @Step
  public boolean isAlertWithMessageVisible(AlertHeader header, String message) {
    return isAlertVisible(header, message);
  }

  @Step
  public TopicDetails clickEditSettingsMenu() {
    editSettingsMenu.shouldBe(Condition.visible).click();
    return this;
  }

  @Step
  public boolean isConfirmationMdlVisible() {
    return isConfirmationModalVisible();
  }

  @Step
  public TopicDetails clickClearMessagesMenu() {
    clearMessagesBtn.shouldBe(Condition.visible).click();
    return this;
  }

  @Step
  public boolean isClearMessagesMenuEnabled() {
    return !Objects.requireNonNull(clearMessagesBtn.shouldBe(Condition.visible)
            .$x("./..").getAttribute("class"))
        .contains("disabled");
  }

  @Step
  public TopicDetails clickRecreateTopicMenu() {
    recreateTopicBtn.shouldBe(Condition.visible).click();
    return this;
  }

  @Step
  public String getCleanUpPolicy() {
    return cleanUpPolicyField.getText();
  }

  @Step
  public int getPartitions() {
    return Integer.parseInt(partitionsField.getText().trim());
  }

  @Step
  public boolean isTopicHeaderVisible(String topicName) {
    return isVisible($x(String.format(topicHeaderLocator, topicName)));
  }

  @Step
  public TopicDetails clickDeleteTopicMenu() {
    removeTopicBtn.shouldBe(Condition.visible).click();
    return this;
  }

  @Step
  public TopicDetails clickConfirmBtnMdl() {
    clickConfirmButton();
    return this;
  }

  @Step
  public TopicDetails clickProduceMessageBtn() {
    clickByJavaScript(produceMessageBtn);
    return this;
  }

  @Step
  public TopicDetails selectSeekTypeDdlMessagesTab(String seekTypeName) {
    seekTypeDdl.shouldBe(Condition.enabled).click();
    $x(String.format(seekFilterDdlLocator, seekTypeName)).shouldBe(Condition.visible).click();
    return this;
  }

  @Step
  public TopicDetails setSeekTypeValueFldMessagesTab(String seekTypeValue) {
    seekTypeField.shouldBe(Condition.enabled).sendKeys(seekTypeValue);
    return this;
  }

  @Step
  public TopicDetails clickSubmitFiltersBtnMessagesTab() {
    clickByJavaScript(submitBtn);
    waitUntilSpinnerDisappear();
    return this;
  }

  @Step
  public TopicDetails clickMessagesAddFiltersBtn() {
    addFiltersBtn.shouldBe(Condition.enabled).click();
    return this;
  }

  @Step
  public TopicDetails clickEditActiveFilterBtn(String filterName) {
    $x(String.format(editActiveFilterBtnLocator, filterName))
        .shouldBe(Condition.enabled).click();
    return this;
  }

  @Step
  public TopicDetails clickNextButton() {
    clickNextBtn();
    waitUntilSpinnerDisappear();
    return this;
  }

  @Step
  public TopicDetails openSavedFiltersListMdl() {
    savedFiltersLink.shouldBe(Condition.enabled).click();
    backToCreateFiltersLink.shouldBe(Condition.visible);
    return this;
  }

  @Step
  public boolean isFilterVisibleAtSavedFiltersMdl(String filterName) {
    return isVisible($x(String.format(savedFilterNameLocator, filterName)));
  }

  @Step
  public TopicDetails selectFilterAtSavedFiltersMdl(String filterName) {
    $x(String.format(savedFilterNameLocator, filterName)).shouldBe(Condition.enabled).click();
    return this;
  }

  @Step
  public TopicDetails clickSelectFilterBtnAtSavedFiltersMdl() {
    selectFilterBtnAddFilterMdl.shouldBe(Condition.enabled).click();
    addFilterCodeModalTitle.shouldBe(Condition.disappear);
    return this;
  }

  @Step
  public TopicDetails waitUntilAddFiltersMdlVisible() {
    addFilterCodeModalTitle.shouldBe(Condition.visible);
    return this;
  }

  @Step
  public TopicDetails setFilterCodeFldAddFilterMdl(String filterCode) {
    addFilterCodeTextarea.shouldBe(Condition.enabled).setValue(filterCode);
    return this;
  }

  @Step
  public String getFilterCodeValue() {
    addFilterCodeEditor.shouldBe(Condition.enabled).click();
    String value = addFilterCodeTextarea.getValue();
    if (value == null) {
      return null;
    } else {
      return value.substring(0, value.length() - 2);
    }
  }

  @Step
  public String getFilterNameValue() {
    return displayNameInputAddFilterMdl.shouldBe(Condition.enabled).getValue();
  }

  @Step
  public TopicDetails selectSaveThisFilterCheckboxMdl(boolean select) {
    selectElement(saveThisFilterCheckBoxAddFilterMdl, select);
    return this;
  }

  @Step
  public boolean isSaveThisFilterCheckBoxSelected() {
    return isSelected(saveThisFilterCheckBoxAddFilterMdl);
  }

  @Step
  public TopicDetails setDisplayNameFldAddFilterMdl(String displayName) {
    displayNameInputAddFilterMdl.shouldBe(Condition.enabled).setValue(displayName);
    return this;
  }

  @Step
  public TopicDetails clickAddFilterBtnAndCloseMdl(boolean closeModal) {
    addFilterBtnAddFilterMdl.shouldBe(Condition.enabled).click();
    if (closeModal) {
      addFilterCodeModalTitle.shouldBe(Condition.hidden);
    } else {
      addFilterCodeModalTitle.shouldBe(Condition.visible);
    }
    return this;
  }

  @Step
  public TopicDetails clickSaveFilterBtnAndCloseMdl(boolean closeModal) {
    saveFilterBtnEditFilterMdl.shouldBe(Condition.enabled).click();
    if (closeModal) {
      addFilterCodeModalTitle.shouldBe(Condition.hidden);
    } else {
      addFilterCodeModalTitle.shouldBe(Condition.visible);
    }
    return this;
  }

  @Step
  public boolean isAddFilterBtnAddFilterMdlEnabled() {
    return isEnabled(addFilterBtnAddFilterMdl);
  }

  @Step
  public boolean isBackButtonEnabled() {
    return isEnabled(backBtn);
  }

  @Step
  public boolean isNextButtonEnabled() {
    return isEnabled(nextBtn);
  }

  @Step
  public boolean isActiveFilterVisible(String filterName) {
    return isVisible($x(String.format(activeFilterNameLocator, filterName)));
  }

  @Step
  public String getSearchFieldValue() {
    return searchFld.shouldBe(Condition.visible).getValue();
  }

  public List<SelenideElement> getAllAddFilterModalVisibleElements() {
    return Arrays.asList(savedFiltersLink, displayNameInputAddFilterMdl, addFilterBtnAddFilterMdl,
        cancelBtnAddFilterMdl);
  }

  public List<SelenideElement> getAllAddFilterModalEnabledElements() {
    return Arrays.asList(displayNameInputAddFilterMdl, cancelBtnAddFilterMdl);
  }

  public List<SelenideElement> getAllAddFilterModalDisabledElements() {
    return Collections.singletonList(addFilterBtnAddFilterMdl);
  }

  @Step
  public TopicDetails openConsumerGroup(String consumerId) {
    $x(String.format(consumerIdLocator, consumerId)).click();
    return this;
  }

  private void selectYear(int expectedYear) {
    while (getActualCalendarDate().getYear() > expectedYear) {
      clickByJavaScript(previousMonthButton);
      sleep(1000);
      if (LocalTime.now().plusMinutes(3).isBefore(LocalTime.now())) {
        throw new IllegalArgumentException("Unable to select year");
      }
    }
  }

  private void selectMonth(int expectedMonth) {
    while (getActualCalendarDate().getMonthValue() > expectedMonth) {
      clickByJavaScript(previousMonthButton);
      sleep(1000);
      if (LocalTime.now().plusMinutes(3).isBefore(LocalTime.now())) {
        throw new IllegalArgumentException("Unable to select month");
      }
    }
  }

  private void selectDay(int expectedDay) {
    Objects.requireNonNull($$x(String.format(dayCellLtr, expectedDay)).stream()
        .filter(day -> !Objects.requireNonNull(day.getAttribute("class")).contains("outside-month"))
        .findFirst().orElseThrow()).shouldBe(Condition.enabled).click();
  }

  private void setTime(LocalDateTime dateTime) {
    calendarTimeFld.shouldBe(Condition.enabled)
        .sendKeys(String.valueOf(dateTime.getHour()), String.valueOf(dateTime.getMinute()));
  }

  @Step
  public TopicDetails selectDateAndTimeByCalendar(LocalDateTime dateTime) {
    setTime(dateTime);
    selectYear(dateTime.getYear());
    selectMonth(dateTime.getMonthValue());
    selectDay(dateTime.getDayOfMonth());
    return this;
  }

  private LocalDate getActualCalendarDate() {
    String monthAndYearStr = actualCalendarDate.getText().trim();
    DateTimeFormatter formatter = new DateTimeFormatterBuilder()
        .parseCaseInsensitive()
        .append(DateTimeFormatter.ofPattern("MMMM yyyy"))
        .toFormatter(Locale.ENGLISH);
    YearMonth yearMonth = formatter.parse(monthAndYearStr, YearMonth::from);
    return yearMonth.atDay(1);
  }

  @Step
  public TopicDetails openCalendarSeekType() {
    seekTypeField.shouldBe(Condition.enabled).click();
    actualCalendarDate.shouldBe(Condition.visible);
    return this;
  }

  @Step
  public int getMessageCountAmount() {
    return Integer.parseInt(messageAmountCell.getText().trim());
  }

  private List<TopicDetails.MessageGridItem> initItems() {
    List<TopicDetails.MessageGridItem> gridItemList = new ArrayList<>();
    gridItems.shouldHave(CollectionCondition.sizeGreaterThan(0))
        .forEach(item -> gridItemList.add(new TopicDetails.MessageGridItem(item)));
    return gridItemList;
  }

  @Step
  public TopicDetails.MessageGridItem getMessageByOffset(int offset) {
    return initItems().stream()
        .filter(e -> e.getOffset() == offset)
        .findFirst().orElseThrow();
  }

  @Step
  public TopicDetails.MessageGridItem getMessageByKey(String key) {
    return initItems().stream()
        .filter(e -> e.getKey().equals(key))
        .findFirst().orElseThrow();
  }

  @Step
  public List<MessageGridItem> getAllMessages() {
    return initItems();
  }

  @Step
  public TopicDetails.MessageGridItem getRandomMessage() {
    return getMessageByOffset(nextInt(0, initItems().size() - 1));
  }

  public enum TopicMenu {
    OVERVIEW("Overview"),
    MESSAGES("Messages"),
    CONSUMERS("Consumers"),
    SETTINGS("Settings");

    private final String value;

    TopicMenu(String value) {
      this.value = value;
    }

    public String toString() {
      return value;
    }
  }

  public static class MessageGridItem extends BasePage {

    private final SelenideElement element;

    private MessageGridItem(SelenideElement element) {
      this.element = element;
    }

    @Step
    public MessageGridItem clickExpand() {
      clickByJavaScript(element.$x("./td[1]/span"));
      return this;
    }

    private SelenideElement getOffsetElm() {
      return element.$x("./td[2]");
    }

    @Step
    public int getOffset() {
      return Integer.parseInt(getOffsetElm().getText().trim());
    }

    @Step
    public int getPartition() {
      return Integer.parseInt(element.$x("./td[3]").getText().trim());
    }

    @Step
    public LocalDateTime getTimestamp() {
      String timestampValue = element.$x("./td[4]/div").getText().trim();
      DateTimeFormatter formatter = DateTimeFormatter.ofPattern("M/d/yyyy, HH:mm:ss");
      return LocalDateTime.parse(timestampValue, formatter);
    }

    @Step
    public String getKey() {
      return element.$x("./td[5]").getText().trim();
    }

    @Step
    public String getValue() {
      return element.$x("./td[6]").getAttribute("title");
    }

    @Step
    public MessageGridItem openDotMenu() {
      getOffsetElm().hover();
      element.$x("./td[7]/div/button[@aria-label='Dropdown Toggle']")
          .shouldBe(Condition.visible).click();
      return this;
    }

    @Step
    public MessageGridItem clickCopyToClipBoard() {
      clickByJavaScript(element.$x("./td[7]//li[text() = 'Copy to clipboard']")
          .shouldBe(Condition.visible));
      return this;
    }

    @Step
    public MessageGridItem clickSaveAsFile() {
      clickByJavaScript(element.$x("./td[7]//li[text() = 'Save as a file']")
          .shouldBe(Condition.visible));
      return this;
    }
  }
}
