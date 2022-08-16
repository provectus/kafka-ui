package com.provectus.kafka.ui.serdes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.bind.BindException;
import org.springframework.mock.env.MockEnvironment;

class PropertyResolverImplTest {

  private static final String TEST_STRING_VALUE = "testStr";
  private static final int TEST_INT_VALUE = 123;
  private static final List<String> TEST_STRING_LIST = List.of("v1", "v2", "v3");
  private static final List<Integer> TEST_INT_LIST = List.of(1, 2, 3);

  private final MockEnvironment env = new MockEnvironment();

  @Data
  @AllArgsConstructor
  public static class CustomPropertiesClass {
    private String f1;
    private Integer f2;
  }

  @Test
  void returnsEmptyOptionalWhenPropertyNotExist() {
    var resolver = new PropertyResolverImpl(env);
    assertThat(resolver.getProperty("nonExistingProp", String.class)).isEmpty();
    assertThat(resolver.getListProperty("nonExistingProp", String.class)).isEmpty();
    assertThat(resolver.getMapProperty("nonExistingProp", String.class, String.class)).isEmpty();
  }

  @Test
  void throwsExceptionWhenPropertyCantBeResolverToRequstedClass() {
    env.setProperty("prop.0.strProp", "testStr");
    env.setProperty("prop.0.strLst", "v1,v2,v3");
    env.setProperty("prop.0.strMap.k1", "v1");

    var resolver = new PropertyResolverImpl(env);
    assertThatCode(() -> resolver.getProperty("prop.0.strProp", Integer.class))
        .isInstanceOf(BindException.class);
    assertThatCode(() -> resolver.getListProperty("prop.0.strLst", Integer.class))
        .isInstanceOf(BindException.class);
    assertThatCode(() -> resolver.getMapProperty("prop.0.strMap", Integer.class, String.class))
        .isInstanceOf(BindException.class);
  }

  @Test
  void resolvedSingleValueProperties() {
    env.setProperty("prop.0.strProp", "testStr");
    env.setProperty("prop.0.intProp", "123");

    var resolver = new PropertyResolverImpl(env);
    assertThat(resolver.getProperty("prop.0.strProp", String.class))
        .hasValue("testStr");
    assertThat(resolver.getProperty("prop.0.intProp", Integer.class))
        .hasValue(123);
  }

  @Test
  void resolvesListProperties() {
    env.setProperty("prop.0.strLst", "v1,v2,v3");
    env.setProperty("prop.0.intLst", "1,2,3");

    var resolver = new PropertyResolverImpl(env);
    assertThat(resolver.getListProperty("prop.0.strLst", String.class))
        .hasValue(List.of("v1", "v2", "v3"));
    assertThat(resolver.getListProperty("prop.0.intLst", Integer.class))
        .hasValue(List.of(1, 2, 3));
  }

  @Test
  void resolvesCustomConfigClassProperties() {
    env.setProperty("prop.0.custProps.f1", "f1val");
    env.setProperty("prop.0.custProps.f2", "1234");

    var resolver = new PropertyResolverImpl(env);
    assertThat(resolver.getProperty("prop.0.custProps", CustomPropertiesClass.class))
        .hasValue(new CustomPropertiesClass("f1val", 1234));
  }

  @Test
  void resolvesMapProperties() {
    env.setProperty("prop.0.strMap.k1", "v1");
    env.setProperty("prop.0.strMap.k2", "v2");
    env.setProperty("prop.0.intToLongMap.100", "111");
    env.setProperty("prop.0.intToLongMap.200", "222");

    var resolver = new PropertyResolverImpl(env);
    assertThat(resolver.getMapProperty("prop.0.strMap", String.class, String.class))
        .hasValue(Map.of("k1", "v1", "k2", "v2"));
    assertThat(resolver.getMapProperty("prop.0.intToLongMap", Integer.class, Long.class))
        .hasValue(Map.of(100, 111L, 200, 222L));
  }


  @Nested
  class WithPrefix {

    @Test
    void resolvedSingleValueProperties() {
      env.setProperty("prop.0.strProp", "testStr");
      env.setProperty("prop.0.intProp", "123");

      var resolver = new PropertyResolverImpl(env, "prop.0");
      assertThat(resolver.getProperty("strProp", String.class))
          .hasValue(TEST_STRING_VALUE);

      assertThat(resolver.getProperty("intProp", Integer.class))
          .hasValue(TEST_INT_VALUE);
    }

    @Test
    void resolvesListProperties() {
      env.setProperty("prop.0.strLst", "v1,v2,v3");
      env.setProperty("prop.0.intLst", "1,2,3");

      var resolver = new PropertyResolverImpl(env, "prop.0");
      assertThat(resolver.getListProperty("strLst", String.class))
          .hasValue(TEST_STRING_LIST);
      assertThat(resolver.getListProperty("intLst", Integer.class))
          .hasValue(TEST_INT_LIST);
    }

    @Test
    void resolvesCustomConfigClassProperties() {
      env.setProperty("prop.0.custProps.f1", "f1val");
      env.setProperty("prop.0.custProps.f2", "1234");

      var  resolver = new PropertyResolverImpl(env, "prop.0");
      assertThat(resolver.getProperty("custProps", CustomPropertiesClass.class))
          .hasValue(new CustomPropertiesClass("f1val", 1234));
    }

    @Test
    void resolvesMapProperties() {
      env.setProperty("prop.0.strMap.k1", "v1");
      env.setProperty("prop.0.strMap.k2", "v2");
      env.setProperty("prop.0.intToLongMap.100", "111");
      env.setProperty("prop.0.intToLongMap.200", "222");

      var resolver = new PropertyResolverImpl(env, "prop.0.");
      assertThat(resolver.getMapProperty("strMap", String.class, String.class))
          .hasValue(Map.of("k1", "v1", "k2", "v2"));
      assertThat(resolver.getMapProperty("intToLongMap", Integer.class, Long.class))
          .hasValue(Map.of(100, 111L, 200, 222L));
    }
  }

}