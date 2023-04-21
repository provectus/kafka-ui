package com.provectus.kafka.ui.service.ksql.response;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ResponseParserTest {

  @Test
  void parsesSelectHeaderIntoColumnNames() {
    assertThat(ResponseParser.parseSelectHeadersString("`inQuotes` INT, notInQuotes INT"))
        .containsExactly("`inQuotes` INT", "notInQuotes INT");

    assertThat(ResponseParser.parseSelectHeadersString("`name with comma,` INT, name2 STRING"))
        .containsExactly("`name with comma,` INT", "name2 STRING");

    assertThat(ResponseParser.parseSelectHeadersString(
        "`topLvl` INT, `struct` STRUCT<`nested1` STRING, anotherName STRUCT<nested2 INT>>"))
        .containsExactly(
            "`topLvl` INT",
            "`struct` STRUCT<`nested1` STRING, anotherName STRUCT<nested2 INT>>"
        );
  }

}
