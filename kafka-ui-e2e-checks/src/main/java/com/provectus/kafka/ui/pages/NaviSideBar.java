package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.topic.TopicView;
import com.provectus.kafka.ui.pages.topic.TopicsList;
import com.provectus.kafka.ui.utilities.WaitUtils;
import com.provectus.kafka.ui.settings.Source;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.utilities.WebUtils.javaExecutorClick;

@ExtensionMethod({WaitUtils.class})
public class NaviSideBar {

//    protected final SelenideElement schemaRegistry = $(By.xpath("//a[@title = 'Schema Registry']"));
//    protected final SelenideElement topics = $(By.xpath("//a[@title = 'Topics']"));
//    protected final SelenideElement connectors = $(By.xpath("//a[@title = 'Kafka Connect']"));

    private static final String path = "/";



    @Step
    public NaviSideBar dashboard() {
        Selenide.open(Source.BASE_WEB_URL + path);
        return this;
    }

//    @Step
//    public NaviSideBar waitUntilScreenReady() {
//        $(By.xpath("//*[contains(text(),'Loading')]")).shouldBe(Condition.disappear);
//        $("input[name=switchRoundedDefault]").parent().$("span").shouldBe(Condition.visible);
//        return new NaviSideBar;
//    }


//    public SchemaRegistryList clickOnSchemaRegistry(){
//        javaExecutorClick(schemaRegistry);
//        return new SchemaRegistryList();
//    }
//    public TopicsList clickOnTopics(SideMenuOptions options){
//        javaExecutorClick(options.value);
//        return new TopicsList();
//    }
    public void selectSideMenuTab(SideMenuOptions options){
        javaExecutorClick(options.value);
    }

    public enum SideMenuOptions {
        BROKERS("Brokers"),
        TOPICS("Topics"),
        CONSUMERS("Consumers"),
        SCHEMA_REGISTRY("Schema Registry"),
        CONNECTORS("Kafka Connect");

        final SelenideElement value;

        SideMenuOptions(String value) {
            this.value =  $x("//a[@title = '"+ value +"']");;
        }
    }

//    private static class selectOption {
//
//        private final SelenideElement selectElement;
//
//        public selectOption(String selectElementName) {
//            this.selectElement = $x("//a[@title = "+ selectElementName +"]");
//        }
//
//        private selectOption(SelenideElement selectElement) {
//            this.selectElement = selectElement;
//        }
//    public ConnectorsList clickOnConnectors(SideMenuOptions options){
//        javaExecutorClick(options);
//        return new ConnectorsList();
//    }

}