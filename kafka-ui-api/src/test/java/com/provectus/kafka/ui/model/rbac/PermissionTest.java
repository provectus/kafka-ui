package com.provectus.kafka.ui.model.rbac;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import java.util.List;
import org.junit.jupiter.api.Test;

class PermissionTest {

  @Test
  void transformSetsParseableFields() {
    var p = new Permission();
    p.setResource("toPic");
    p.setActions(List.of("vIEW", "EdiT"));
    p.setValue("patt|ern");

    p.transform();

    assertThat(p.getParsedActions())
        .isEqualTo(List.of(TopicAction.VIEW, TopicAction.EDIT));

    assertThat(p.getCompiledValuePattern())
        .isNotNull()
        .matches(pattern -> pattern.pattern().equals("patt|ern"));
  }

  @Test
  void transformSetsFullActionsListIfAllActionPassed() {
    var p = new Permission();
    p.setResource("toPic");
    p.setActions(List.of("All"));

    p.transform();

    assertThat(p.getParsedActions())
        .isEqualTo(List.of(TopicAction.values()));
  }

  @Test
  void transformUnnestsDependantActions() {
    var p = new Permission();
    p.setResource("toPic");
    p.setActions(List.of("EDIT"));

    p.transform();

    assertThat(p.getParsedActions())
        .containsExactlyInAnyOrder(TopicAction.VIEW, TopicAction.EDIT);
  }

}
