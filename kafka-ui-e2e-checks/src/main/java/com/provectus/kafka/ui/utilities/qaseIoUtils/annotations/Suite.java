package com.provectus.kafka.ui.utilities.qaseIoUtils.annotations;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface Suite {
    long suiteId();
    String title();
}
