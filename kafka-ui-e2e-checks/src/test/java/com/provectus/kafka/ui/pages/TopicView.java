
    @SneakyThrows
    public ProduceMessagePage clickOnButton(String buttonName) {
        logger.info("clickOnButton == '{}'", buttonName);
        $(By.xpath("//div[@class ='buttons']//*[text()='%s']".formatted(buttonName))).click();
        return new ProduceMessagePage();
    }

    @SneakyThrows
    public TopicView changeCleanupPolicy(String cleanupPolicyValue) {
        cleanupPolicy.click();
        $(By.xpath("//select/option[@value = '%s']".formatted(cleanupPolicyValue))).click();
        return this;
    }

    @SneakyThrows
    public TopicView changeTimeToRetainValue(String timeToRetainValue) {
        timeToRetain.clear();
        timeToRetain.sendKeys(String.valueOf(timeToRetainValue));
        return this;
    }

    @SneakyThrows
    public TopicView changeMaxSizeOnDisk(String maxSizeOnDiskValue) {
        maxSizeOnDisk.click();
        $(By.xpath("//select/option[text() = '%s']".formatted(maxSizeOnDiskValue))).click();
        return this;
    }

    @SneakyThrows
    public TopicView changeMaxMessageBytes(String maxMessageBytesValue) {
        maxMessageBytes.clear();
        maxMessageBytes.sendKeys(String.valueOf(maxMessageBytesValue));
        return this;
    }

    @SneakyThrows
    public void submitSettingChanges() {
        $(By.xpath("//input[@type='submit']")).click();
    }

    public TopicView cleanupPolicyIs(String value) {
        cleanupPolicy.waitForSelectedValue(value);
        return this;
    }

    public TopicView timeToRetainIs(String time) {
        Assertions.assertEquals(time, timeToRetain.getValue());
        return this;
    }

    public TopicView maxSizeOnDiskIs(String size) {
        Assertions.assertEquals(size, maxSizeOnDisk.getSelectedText());
        return this;
    }

    public TopicView maxMessageBytesIs(String bytes) {
        Assertions.assertEquals(bytes, maxMessageBytes.getValue());
        return this;
    }

    public boolean isMessageOnPage(String messageName) {
        Optional<SelenideElement> first = $$(By.xpath("//div[@class ='box']//table//tr//td")).stream()
                .filter(e -> e.getText().equals(messageName))
                .findFirst();
        if(first.isPresent()){
            return true;
        }
        return false;
    }
    }




