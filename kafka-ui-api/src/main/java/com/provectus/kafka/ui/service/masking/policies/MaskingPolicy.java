package com.provectus.kafka.ui.service.masking.policies;

import com.fasterxml.jackson.databind.node.ContainerNode;
import com.provectus.kafka.ui.config.ClustersProperties;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public abstract class MaskingPolicy {


  public static MaskingPolicy create(ClustersProperties.Masking property) {
    List<String> fields = property.getFields() == null
        ? List.of() // empty list means that policy will be applied to all fields
        : property.getFields();
    switch (property.getType()) {
      case REMOVE:
        return new Remove(fields);
      case REPLACE:
        return new Replace(
            fields,
            property.getReplacement() == null
                ? Replace.DEFAULT_REPLACEMENT
                : property.getReplacement()
        );
      case MASK:
        return new Mask(
            fields,
            property.getPattern() == null
                ? Mask.DEFAULT_PATTERN
                : property.getPattern()
        );
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
