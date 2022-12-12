package com.provectus.kafka.ui.service.masking.policies;

import com.fasterxml.jackson.databind.node.ContainerNode;
import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.config.ClustersProperties;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public abstract class MaskingPolicy {

  public static MaskingPolicy create(ClustersProperties.Masking property) {
    Preconditions.checkNotNull(property.getFields());
    switch (property.getType()) {
      case REMOVE:
        return new Remove(property.getFields());
      case REPLACE:
        return new Replace(property.getFields(), property.getReplacement());
      case MASK:
        return new Mask(property.getFields(), property.getPattern());
      default:
        throw new IllegalStateException("Unknown policy type: " + property.getType());
    }
  }

  //----------------------------------------------------------------

  // empty list means policy will be applied to all fields
  private final List<String> fieldNames;

  protected boolean fieldShouldBeMasked(String fieldName) {
    return fieldNames.isEmpty() || fieldNames.contains(fieldName);
  }

  public abstract ContainerNode<?> applyToJsonContainer(ContainerNode<?> node);

  public abstract String applyToString(String str);

}
