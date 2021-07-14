package com.provectus.kafka.ui.steps;

import com.provectus.kafka.ui.steps.kafka.KafkaSteps;

public class Steps {

    public static final Steps INSTANCE = new Steps();

    private Steps(){}

    public KafkaSteps kafka = new KafkaSteps();
}
