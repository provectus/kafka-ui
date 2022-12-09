package com.provectus.kafka.ui.service.masking;

import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.node.ContainerNode;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.service.masking.policies.MaskingPolicy;
import java.util.List;
import java.util.regex.Pattern;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class DataMaskingTest {

  private static final String TOPIC = "test_topic";

  private DataMasking masking;

  private MaskingPolicy policy1;
  private MaskingPolicy policy2;
  private MaskingPolicy policy3;

  @BeforeEach
  void init() {
    policy1 = spy(createMaskPolicy());
    policy2 = spy(createMaskPolicy());
    policy3 = spy(createMaskPolicy());

    masking = new DataMasking(
        List.of(
            new DataMasking.Mask(Pattern.compile(TOPIC), null, policy1),
            new DataMasking.Mask(null, Pattern.compile(TOPIC), policy2),
            new DataMasking.Mask(null, Pattern.compile(TOPIC + "|otherTopic"), policy3)));
  }

  private MaskingPolicy createMaskPolicy() {
    var props = new ClustersProperties.Masking();
    props.setType(ClustersProperties.Masking.Type.REMOVE);
    return MaskingPolicy.create(props);
  }

  @ParameterizedTest
  @ValueSource(strings = {
      "{\"some\": \"json\"}",
      "[ {\"json\": \"array\"} ]"
  })
  @SneakyThrows
  void appliesMasksToJsonContainerArgsBasedOnTopicPatterns(String jsonObjOrArr) {
    var parsedJson = (ContainerNode<?>) new JsonMapper().readTree(jsonObjOrArr);

    masking.getMaskingFunction(TOPIC, Serde.Target.KEY).apply(jsonObjOrArr);
    verify(policy1).applyToJsonContainer(eq(parsedJson));
    verifyNoInteractions(policy2, policy3);

    reset(policy1, policy2, policy3);

    masking.getMaskingFunction(TOPIC, Serde.Target.VALUE).apply(jsonObjOrArr);
    verify(policy2).applyToJsonContainer(eq(parsedJson));
    verify(policy3).applyToJsonContainer(eq(policy2.applyToJsonContainer(parsedJson)));
    verifyNoInteractions(policy1);
  }

  @ParameterizedTest
  @ValueSource(strings = {
      "non json str",
      "234",
      "null"
  })
  void appliesFirstFoundMaskToStringArgsBasedOnTopicPatterns(String nonJsonObjOrArrString) {
    masking.getMaskingFunction(TOPIC, Serde.Target.KEY).apply(nonJsonObjOrArrString);
    verify(policy1).applyToString(eq(nonJsonObjOrArrString));
    verifyNoInteractions(policy2, policy3);

    reset(policy1, policy2, policy3);

    masking.getMaskingFunction(TOPIC, Serde.Target.VALUE).apply(nonJsonObjOrArrString);
    verify(policy2).applyToString(eq(nonJsonObjOrArrString));
    verifyNoInteractions(policy1, policy3);
  }

}