package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.provectus.kafka.ui.base.TestConfiguration;
import com.provectus.kafka.ui.extensions.WaitUtils;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;

@ExtensionMethod({WaitUtils.class})
public class MainPage {

  private static final String path = "";

  @Step
  public MainPage goTo(){
    Selenide.open(TestConfiguration.BASE_URL+path);
    return this;
  }
  @Step
  public MainPage isOnPage() {
    $(By.xpath("//*[contains(text(),'Loading')]")).shouldBe(Condition.disappear);
    $(By.xpath("//h5[text()='Clusters']")).shouldBe(Condition.visible);
    return this;
  }

  @SneakyThrows
  public void topicIsVisible(String topicName) {
    By.xpath("//div[contains(@class,'section')]//table//a[text()='%s']".formatted(topicName)).refreshUntil(Condition.visible);
  }

  public enum SideMenuOptions {
    BROKERS("Brokers"),
    TOPICS("Topics"),
    CONSUMERS("Consumers"),
    SCHEMA_REGISTRY("Schema registry");

    String value;

    SideMenuOptions(String value) {
      this.value = value;
    }
  }

  @Step
  public MainPage goToSideMenu(String clusterName, SideMenuOptions option) {
    $(By.xpath("//aside//*[a[text()='%s']]//a[text()='%s']".formatted(clusterName, option.value)))
        .click();
    return this;
  }
}
