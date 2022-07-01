package utils.qaseIO.annotation;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface Suite {
    long suiteId() default 0;
    String title() default "";
}
