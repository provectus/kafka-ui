package com.provectus.kafka.ui.utils.qaseIO.annotation;

import com.provectus.kafka.ui.utils.qaseIO.Status;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface AutomationStatus {

    Status status();
}
