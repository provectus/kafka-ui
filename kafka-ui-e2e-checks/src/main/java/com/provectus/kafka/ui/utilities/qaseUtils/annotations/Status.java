package com.provectus.kafka.ui.utilities.qaseUtils.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Status {

    com.provectus.kafka.ui.utilities.qaseUtils.enums.Status status();
}
