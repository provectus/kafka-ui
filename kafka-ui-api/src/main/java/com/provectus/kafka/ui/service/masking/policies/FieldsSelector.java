package com.provectus.kafka.ui.service.masking.policies;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.exception.ValidationException;
import java.util.regex.Pattern;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

interface FieldsSelector {

  static FieldsSelector create(ClustersProperties.Masking property) {
    if (StringUtils.hasText(property.getFieldsNamePattern()) && !CollectionUtils.isEmpty(property.getFields())) {
      throw new ValidationException("You can't provide both fieldNames & fieldsNamePattern for masking");
    }
    if (StringUtils.hasText(property.getFieldsNamePattern())) {
      Pattern pattern = Pattern.compile(property.getFieldsNamePattern());
      return f -> pattern.matcher(f).matches();
    }
    if (!CollectionUtils.isEmpty(property.getFields())) {
      return f -> property.getFields().contains(f);
    }
    //no pattern, no field names - mean all fields should be masked
    return fieldName -> true;
  }

  boolean shouldBeMasked(String fieldName);

}
