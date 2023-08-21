package com.provectus.kafka.ui.service.masking;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.node.ContainerNode;
import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.model.TopicMessageDTO;
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

  public static DataMasking create(@Nullable List<ClustersProperties.Masking> config) {
    return new DataMasking(
        Optional.ofNullable(config).orElse(List.of()).stream().map(property -> {
          Preconditions.checkNotNull(property.getType(), "masking type not specified");
          Preconditions.checkArgument(
              StringUtils.isNotEmpty(property.getTopicKeysPattern())
                  || StringUtils.isNotEmpty(property.getTopicValuesPattern()),
              "topicKeysPattern or topicValuesPattern (or both) should be set for masking policy");
          return new Mask(
              Optional.ofNullable(property.getTopicKeysPattern()).map(Pattern::compile).orElse(null),
              Optional.ofNullable(property.getTopicValuesPattern()).map(Pattern::compile).orElse(null),
              MaskingPolicy.create(property)
          );
        }).toList()
    );
  }

  @VisibleForTesting
  DataMasking(List<Mask> masks) {
    this.masks = masks;
  }

  public UnaryOperator<TopicMessageDTO> getMaskerForTopic(String topic) {
    var keyMasker = getMaskingFunction(topic, Serde.Target.KEY);
    var valMasker = getMaskingFunction(topic, Serde.Target.VALUE);
    return msg -> msg
        .key(keyMasker.apply(msg.getKey()))
        .content(valMasker.apply(msg.getContent()));
  }

  @VisibleForTesting
  UnaryOperator<String> getMaskingFunction(String topic, Serde.Target target) {
    var targetMasks = masks.stream().filter(m -> m.shouldBeApplied(topic, target)).toList();
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
