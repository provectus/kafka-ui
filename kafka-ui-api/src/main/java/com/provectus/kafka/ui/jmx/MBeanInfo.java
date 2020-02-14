package com.provectus.kafka.ui.jmx;

public class MBeanInfo {

    private String name;
    private String attribute;

    private MBeanInfo(String name, String attribute) {
        this.name = name;
        this.attribute = attribute;
    }

    public String getName() {
        return name;
    }

    public String getAttribute() {
        return attribute;
    }

    public static MBeanInfo of(String name, String attribute) {
        return new MBeanInfo(name, attribute);
    }
}
