package com.provectus.kafka.ui.utilities.qaseIoUtils.annotations;

import com.provectus.kafka.ui.utilities.qaseIoUtils.enums.Status;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface AutomationStatus {

    Status status();
}
