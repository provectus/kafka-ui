package com.provectus.kafka.ui.service.masking;

import static java.util.stream.Collectors.toList;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.node.ContainerNode;
import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.service.masking.policies.MaskingPolicy;
import java.util.List;
import java.util.Optional;
import java.util.function.UnaryOperator;
import java.util.regex.Pattern;
import javax.annotation.Nullable;
import lombok.Value;
import org.apache.commons.lang3.StringUtils;

public class DataMasking {

  private static final JsonMapper JSON_MAPPER = new JsonMapper();

  @Value
  static class Mask {
    @Nullable
    Pattern topicKeysPattern;
    @Nullable
    Pattern topicValuesPattern;

    MaskingPolicy policy;

    boolean shouldBeApplied(String topic, Serde.Target target) {
      return target == Serde.Target.KEY
          ? topicKeysPattern != null && topicKeysPattern.matcher(topic).matches()
          : topicValuesPattern != null && topicValuesPattern.matcher(topic).matches();
    }
  }

  private final List<Mask> masks;

  public static DataMasking create(List<ClustersProperties.Masking> config) {
    return new DataMasking(
        config.stream().map(property -> {
          Preconditions.checkNotNull(property.getType(), "masking type not specifed");
          Preconditions.checkArgument(
              StringUtils.isNotEmpty(property.getTopicValuesPattern())
                  || StringUtils.isNotEmpty(property.getTopicValuesPattern()),
              "topicKeysPattern or topicValuesPattern (or both) should be set for masking policy");
          return new Mask(
              Optional.ofNullable(property.getTopicKeysPattern()).map(Pattern::compile).orElse(null),
              Optional.ofNullable(property.getTopicValuesPattern()).map(Pattern::compile).orElse(null),
              MaskingPolicy.create(property)
          );
        }).collect(toList()));
  }

  @VisibleForTesting
  public DataMasking(List<Mask> masks) {
    this.masks = masks;
  }

  public UnaryOperator<String> getMaskingFunction(String topic, Serde.Target target) {
    var targetMasks = masks.stream().filter(m -> m.shouldBeApplied(topic, target)).collect(toList());
    if (targetMasks.isEmpty()) {
      return UnaryOperator.identity();
    }
    return inputStr -> {
      if (inputStr == null) {
        return null;
      }
      try {
        JsonNode json = JSON_MAPPER.readTree(inputStr);
        if (json.isContainerNode()) {
          for (Mask targetMask : targetMasks) {
            json = targetMask.policy.applyToJsonContainer((ContainerNode<?>) json);
          }
          return json.toString();
        }
      } catch (JsonProcessingException jsonException) {
        //just ignore
      }
      // if we can't parse input as json or parsed json is not object/array
      // we just apply first found policy
      // (there is no need to apply all of them, because they will just override each other)
      return targetMasks.get(0).policy.applyToString(inputStr);
    };
  }

}
