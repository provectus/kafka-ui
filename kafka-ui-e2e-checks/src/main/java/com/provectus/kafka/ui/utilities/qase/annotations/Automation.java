package com.provectus.kafka.ui.utilities.qase.annotations;

import com.provectus.kafka.ui.utilities.qase.enums.State;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Automation {

  State state();
}
