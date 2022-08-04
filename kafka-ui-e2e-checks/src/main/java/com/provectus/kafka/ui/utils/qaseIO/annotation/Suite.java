package com.provectus.kafka.ui.utils.qaseIO.annotation;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface Suite {
    long suiteId();
    String title();
}
