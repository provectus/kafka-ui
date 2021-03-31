package com.provectus.kafka.ui.util;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class NumberUtilTest {

  @Test
  void shouldReturnFalseWhenNonNumeric() {
    Assertions.assertFalse(NumberUtil.isNumeric(Double.POSITIVE_INFINITY));
    Assertions.assertFalse(NumberUtil.isNumeric(Double.NEGATIVE_INFINITY));
    Assertions.assertFalse(NumberUtil.isNumeric(Double.NaN));
    Assertions.assertFalse(NumberUtil.isNumeric(null));
    Assertions.assertFalse(NumberUtil.isNumeric(" "));
    Assertions.assertFalse(NumberUtil.isNumeric(new Object()));
    Assertions.assertFalse(NumberUtil.isNumeric("1231asd"));
  }

  @Test
  void shouldReturnTrueWhenNumeric() {
    Assertions.assertTrue(NumberUtil.isNumeric("123.45"));
    Assertions.assertTrue(NumberUtil.isNumeric(123.45));
    Assertions.assertTrue(NumberUtil.isNumeric(123));
    Assertions.assertTrue(NumberUtil.isNumeric(-123.45));
    Assertions.assertTrue(NumberUtil.isNumeric(-1e-10));
    Assertions.assertTrue(NumberUtil.isNumeric(1e-10));
  }
}