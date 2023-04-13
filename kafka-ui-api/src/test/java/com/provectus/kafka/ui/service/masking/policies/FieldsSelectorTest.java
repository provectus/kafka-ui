package com.provectus.kafka.ui.service.masking.policies;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.exception.ValidationException;
import java.util.List;
import org.junit.jupiter.api.Test;

class FieldsSelectorTest {

  @Test
  void selectsFieldsDueToProvidedPattern() {
    var properties = new ClustersProperties.Masking();
    properties.setFieldsNamePattern("f1|f2");

    var selector = FieldsSelector.create(properties);
    assertThat(selector.shouldBeMasked("f1")).isTrue();
    assertThat(selector.shouldBeMasked("f2")).isTrue();
    assertThat(selector.shouldBeMasked("doesNotMatchPattern")).isFalse();
  }

  @Test
  void selectsFieldsDueToProvidedFieldNames() {
    var properties = new ClustersProperties.Masking();
    properties.setFields(List.of("f1", "f2"));

    var selector = FieldsSelector.create(properties);
    assertThat(selector.shouldBeMasked("f1")).isTrue();
    assertThat(selector.shouldBeMasked("f2")).isTrue();
    assertThat(selector.shouldBeMasked("notInAList")).isFalse();
  }

  @Test
  void selectAllFieldsIfNoPatternAndNoNamesProvided() {
    var properties = new ClustersProperties.Masking();

    var selector = FieldsSelector.create(properties);
    assertThat(selector.shouldBeMasked("anyPropertyName")).isTrue();
  }

  @Test
  void throwsExceptionIfBothFieldListAndPatternProvided() {
    var properties = new ClustersProperties.Masking();
    properties.setFieldsNamePattern("f1|f2");
    properties.setFields(List.of("f3", "f4"));

    assertThatThrownBy(() -> FieldsSelector.create(properties))
        .isInstanceOf(ValidationException.class);
  }

}
