package com.provectus.kafka.ui.service.acl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.provectus.kafka.ui.exception.ValidationException;
import java.util.Collection;
import java.util.List;
import org.apache.kafka.common.acl.AccessControlEntry;
import org.apache.kafka.common.acl.AclBinding;
import org.apache.kafka.common.acl.AclOperation;
import org.apache.kafka.common.acl.AclPermissionType;
import org.apache.kafka.common.resource.PatternType;
import org.apache.kafka.common.resource.ResourcePattern;
import org.apache.kafka.common.resource.ResourceType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class AclCsvTest {

  private static final List<AclBinding> TEST_BINDINGS = List.of(
      new AclBinding(
          new ResourcePattern(ResourceType.TOPIC, "*", PatternType.LITERAL),
          new AccessControlEntry("User:test1", "*", AclOperation.READ, AclPermissionType.ALLOW)),
      new AclBinding(
          new ResourcePattern(ResourceType.GROUP, "group1", PatternType.PREFIXED),
          new AccessControlEntry("User:test2", "localhost", AclOperation.DESCRIBE, AclPermissionType.DENY))
  );

  @ParameterizedTest
  @ValueSource(strings = {
      "Principal,ResourceType, PatternType, ResourceName,Operation,PermissionType,Host\n"
          + "User:test1,TOPIC,LITERAL,*,READ,ALLOW,*\n"
          + "User:test2,GROUP,PREFIXED,group1,DESCRIBE,DENY,localhost",

      //without header
      "User:test1,TOPIC,LITERAL,*,READ,ALLOW,*\n"
          + "\n"
          + "User:test2,GROUP,PREFIXED,group1,DESCRIBE,DENY,localhost"
          + "\n"
  })
  void parsesValidInputCsv(String csvString) {
    Collection<AclBinding> parsed = AclCsv.parseCsv(csvString);
    assertThat(parsed).containsExactlyInAnyOrderElementsOf(TEST_BINDINGS);
  }

  @ParameterizedTest
  @ValueSource(strings = {
      // columns > 7
      "User:test1,TOPIC,LITERAL,*,READ,ALLOW,*,1,2,3,4",
      // columns < 7
      "User:test1,TOPIC,LITERAL,*",
      // enum values are illegal
      "User:test1,ILLEGAL,LITERAL,*,READ,ALLOW,*",
      "User:test1,TOPIC,LITERAL,*,READ,ILLEGAL,*"
  })
  void throwsExceptionForInvalidInputCsv(String csvString) {
    assertThatThrownBy(() -> AclCsv.parseCsv(csvString))
        .isInstanceOf(ValidationException.class);
  }

  @Test
  void transformAndParseUseSameFormat() {
    String csv = AclCsv.transformToCsvString(TEST_BINDINGS);
    Collection<AclBinding> parsedBindings = AclCsv.parseCsv(csv);
    assertThat(parsedBindings).containsExactlyInAnyOrderElementsOf(TEST_BINDINGS);
  }

}
