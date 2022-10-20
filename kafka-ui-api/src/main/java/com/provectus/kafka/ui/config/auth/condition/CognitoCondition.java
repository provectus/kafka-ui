package com.provectus.kafka.ui.config.auth.condition;

import com.provectus.kafka.ui.service.rbac.AbstractProviderCondition;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

public class CognitoCondition extends AbstractProviderCondition implements Condition {
  @Override
  public boolean matches(final ConditionContext context, final AnnotatedTypeMetadata metadata) {
    return getRegisteredProviders(context.getEnvironment()).stream().anyMatch(a -> a.equalsIgnoreCase("cognito"));
  }
}