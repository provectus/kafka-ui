package com.provectus.kafka.ui.util.annotation;

/**
 * All code places that depend on kafka-client's internals or implementation-specific logic
 * should be marked with this annotation to make further update process easier.
 */
public @interface KafkaClientInternalsDependant {
}
