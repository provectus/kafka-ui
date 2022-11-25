package com.provectus.kafka.ui.pages.topic.enums;

public enum MaxSizeOnDisk {
  NOT_SET("-1", "Not Set"),
  SIZE_1_GB("1073741824", "1 GB"),
  SIZE_10_GB("10737418240", "10 GB"),
  SIZE_20_GB("21474836480", "20 GB"),
  SIZE_50_GB("53687091200", "50 GB");

  private final String optionValue;
  private final String visibleText;

  MaxSizeOnDisk(String optionValue, String visibleText) {
    this.optionValue = optionValue;
    this.visibleText = visibleText;
  }

  public String getOptionValue() {
    return optionValue;
  }

  public String getVisibleText() {
    return visibleText;
  }
}

