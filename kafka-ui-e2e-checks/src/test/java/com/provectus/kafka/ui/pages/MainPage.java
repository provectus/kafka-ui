package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;

public class MainPage {

  private static final long TIMEOUT = 25000;

  @Step
  public MainPage shouldBeOnPage() {
    $(By.xpath("//*[contains(text(),'Loading')]")).shouldBe(Condition.disappear);
    $(By.xpath("//h5[text()='Clusters']")).shouldBe(Condition.visible);
    return this;
  }


  private void refreshUntil(By by){
    int i =0;
    do
    {
      refresh();
      i++;
      sleep(2000);
    } while(getElements(by).size()<1 && i!=20);
    $(by).shouldBe(Condition.visible);
  }

  @SneakyThrows
  public void shouldBeTopic(String topicName) {
    refreshUntil(By.xpath("//div[contains(@class,'section')]//table//a[text()='%s']".formatted(topicName)));
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
