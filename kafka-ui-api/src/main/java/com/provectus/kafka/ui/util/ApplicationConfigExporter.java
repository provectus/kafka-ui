package com.provectus.kafka.ui.util;

import static org.springframework.boot.context.properties.source.ConfigurationPropertyName.Form;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.google.common.collect.Streams;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.source.ConfigurationPropertyName;
import org.springframework.boot.context.properties.source.ConfigurationPropertySource;
import org.springframework.boot.context.properties.source.ConfigurationPropertySources;
import org.springframework.boot.context.properties.source.IterableConfigurationPropertySource;
import org.springframework.core.env.Environment;
import org.springframework.core.env.SystemEnvironmentPropertySource;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;

@Slf4j
@UtilityClass
public class ApplicationConfigExporter {

  private static final Set<String> EXPORTED_PROPS_PREFIXES = Set.of(
      "kafka",
      "topic",
      "spring.jmx",
      "spring.security",
      "auth",
      "management",
      "server.servlet",
      "rbac"
  );

  private static final Predicate<ConfigurationPropertyName> CONFIG_PROPS_FILTER = name -> {
    String nameString = name.toString();
    return EXPORTED_PROPS_PREFIXES.stream().anyMatch(nameString::startsWith);
  };

  private static Map<String, Object> exportAsMap(Environment appEnv) {
    Map<String, Object> result = new LinkedHashMap<>();

    var orderedSources = Streams.stream(ConfigurationPropertySources.get(appEnv))
        .filter(IterableConfigurationPropertySource.class::isInstance)
        .map(IterableConfigurationPropertySource.class::cast)
        .toList();

    //[TODO: check]: iterating in reverse order (starting with lower-priority sources) to keep override semantics
    for (var source : Lists.reverse(orderedSources)) {
      source.stream()
          .filter(CONFIG_PROPS_FILTER)
          .forEach(propertyName -> {
            propertyName = adapPropertyName(source, propertyName);
            fillMap(propertyName, propertyName, source.getConfigurationProperty(propertyName).getValue(), result,
                new ClusterPropertiesCustomExporting());
          });
    }
    return result;
  }

  private static ConfigurationPropertyName adapPropertyName(ConfigurationPropertySource source,
                                                            ConfigurationPropertyName name) {
    if (source.getUnderlyingSource() instanceof SystemEnvironmentPropertySource) {
      return adaptEnvPropertyName(name);
    }
    return name;
  }

  private static ConfigurationPropertyName adaptEnvPropertyName(ConfigurationPropertyName name) {
    String str = name.toString();
    Matcher m = Pattern.compile("\\.[0-9]*\\.").matcher(str);
    StringBuilder sb = new StringBuilder(str);
    while (m.find()) {
      sb.replace(
          m.start(), m.end(),
          m.group().replaceFirst("\\.", "[").replaceFirst("\\.", "].")
      );
    }
    return ConfigurationPropertyName.of(sb);
  }

  @SneakyThrows
  public static String exportAsJson(Environment appEnv) {
    return new JsonMapper().writeValueAsString(exportAsMap(appEnv));
  }

  public static String exportAsYaml(Environment appEnv) {
    var dumperOptions = new DumperOptions();
    dumperOptions.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
    return new Yaml(dumperOptions).dump(exportAsMap(appEnv));
  }

  private static void fillMap(
      ConfigurationPropertyName rootPropertyName,
      ConfigurationPropertyName propertyName,
      Object value,
      Map<String, Object> sink,
      CustomExporting... customExportings) {

    for (CustomExporting customExporting : customExportings) {
      if (customExporting.apply(rootPropertyName, propertyName, value, sink)) {
        return;
      }
    }

    var currentLevelName = getNameElement(propertyName, 0);
    if (propertyName.getNumberOfElements() == 1) {
      sink.put(currentLevelName, value);
    } else {
      var child = propertyName.subName(1);
      if (child.isNumericIndex(0)) {
        var nextLevel = (List<Object>) sink.computeIfAbsent(currentLevelName, k -> new ArrayList());
        sink.put(currentLevelName, nextLevel);
        fillArray(rootPropertyName, child, value, nextLevel, customExportings);
      } else {
        var nextLevel = (Map<String, Object>) sink.computeIfAbsent(currentLevelName, k -> new LinkedHashMap());
        sink.put(currentLevelName, nextLevel);
        fillMap(rootPropertyName, child, value, nextLevel, customExportings);
      }
    }
  }

  private static void fillArray(
      ConfigurationPropertyName rootPropertyName,
      ConfigurationPropertyName propertyName,
      Object value,
      List<Object> sinkArray,
      CustomExporting... customExportings) {

    for (CustomExporting customExporting : customExportings) {
      if (customExporting.apply(rootPropertyName, propertyName, value, sinkArray)) {
        return;
      }
    }

    int idx = Integer.parseInt(getNameElement(propertyName, 0));
    growListToIndex(sinkArray, idx);

    var child = propertyName.subName(1);
    if (!child.isEmpty()) {
      Map<String, Object> nextLevel = (Map<String, Object>) sinkArray.get(idx);
      if (nextLevel == null) {
        nextLevel = new LinkedHashMap<>();
      }
      sinkArray.set(idx, nextLevel);
      fillMap(rootPropertyName, child, value, nextLevel, customExportings);
    } else {
      sinkArray.set(idx, value);
    }
  }

  private static String getNameElement(ConfigurationPropertyName name, int idx) {
    return name.getElement(idx, Form.ORIGINAL);
  }

  private static void growListToIndex(List<Object> lst, int idx) {
    for (int i = 0; i <= idx; i++) {
      if (lst.size() - 1 < i) {
        lst.add(null);
      }
    }
  }

  //------------------------------------------------------------------------------

  private interface CustomExporting {

    default boolean apply(ConfigurationPropertyName rootPropertyName,
                          ConfigurationPropertyName propertyName,
                          Object value,
                          Map<String, Object> sink) {
      return false;
    }

    default boolean apply(ConfigurationPropertyName rootProperty,
                          ConfigurationPropertyName propertyName,
                          Object value,
                          List<Object> sinkArray) {
      return false;
    }
  }

  private static final class ClusterPropertiesCustomExporting implements CustomExporting {
    @Override
    public boolean apply(ConfigurationPropertyName rootProperty,
                         ConfigurationPropertyName propertyName,
                         Object value,
                         Map<String, Object> sinkMap) {
      if (getNameElement(propertyName, 0).equals("properties")) {
        Map<String, Object> map =
            (Map<String, Object>) sinkMap.computeIfAbsent("properties", k -> new LinkedHashMap<>());
        sinkMap.put("properties", map);
        map.put(propertyName.subName(1).toString(), value);  //todo case sensitivity
        return true;
      }
      return false;
    }
  }

}
