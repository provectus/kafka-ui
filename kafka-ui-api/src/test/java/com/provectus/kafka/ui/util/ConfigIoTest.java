package com.provectus.kafka.ui.util;

import com.google.common.collect.Streams;
import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.config.ClustersProperties;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.context.properties.source.ConfigurationPropertySources;
import org.springframework.boot.context.properties.source.IterableConfigurationPropertySource;
import org.springframework.boot.context.properties.source.MapConfigurationPropertySource;
import org.springframework.boot.json.YamlJsonParser;
import org.springframework.core.env.MapPropertySource;
import org.springframework.util.CollectionUtils;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;

public class ConfigIoTest extends AbstractIntegrationTest {

  @Test
  public void test() {
    Streams.stream(
            ConfigurationPropertySources.get(applicationContext.getEnvironment())
                .iterator())
        .filter(ps -> ps instanceof IterableConfigurationPropertySource)
        .map(cps -> ((IterableConfigurationPropertySource) cps))
        .toList();

//    Stream.of(
//            applicationContext.getEnvironment().getPropertySources().stream()
//                .filter(ps -> ps instanceof SystemEnvironmentPropertySource)
//                .map(ps -> (SystemEnvironmentPropertySource) ps)
//                .findFirst()
//                .get()
//                .getPropertyNames()
//        )
//        .map(p -> ConfigurationPropertyName.adapt(p, '_'))
//        .toList()
//

    var dumperOptions = new DumperOptions();
    dumperOptions.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
    ///dumperOptions.setPrettyFlow(true);
    var yaml = new Yaml(
        dumperOptions
    );
    var parsed = yaml.loadAs(
//        """
//             {
//              "kafka" : {
//                "clusters": [
//                   {"name": "c1", "bootstrapServers": "ololo:9092" },
//                   {"name": "c2", "bootstrapServers": "ololo:90923"}
//                 ]
//              }
//
//            }
//             """,
        """
            kafka:
              clusters:
                - name: c1
                  bootstrapServers: "ololo:9092"
                  properties:
                    "client.id": "test_client_id123"
                - name: c2
                  bootstrapServers: "ololo:9092"
            """,
        LinkedHashMap.class
    );

    System.out.println("Dumped: " + yaml.dump(parsed));

    System.out.println(flatten(parsed));

    var ps = new MapPropertySource("test", flatten(parsed));

    Binder b = new Binder(new MapConfigurationPropertySource(flatten(parsed)));
    var cluster = b.bind("kafka.clusters.0", ClustersProperties.Cluster.class).get();
    System.out.println(cluster);

    new MapConfigurationPropertySource(flatten(parsed)).stream()
        .forEach(System.out::println);


    System.out.println("\n\n" + yaml.dump(cluster));
  }

  private static Map<String, Object> flatten(Map<String, Object> map) {
    Map<String, Object> result = new LinkedHashMap<>();
    flatten(null, result, map);
    return result;
  }

  private static void flatten(String prefix, Map<String, Object> result, Map<String, Object> map) {
    String namePrefix = (prefix != null) ? prefix + "." : "";
    map.forEach((key, value) -> extract(namePrefix + key, result, value));
  }

  @SuppressWarnings("unchecked")
  private static void extract(String name, Map<String, Object> result, Object value) {
    if (value instanceof Map) {
      if (CollectionUtils.isEmpty((Map<?, ?>) value)) {
        result.put(name, value);
        return;
      }
      flatten(name, result, (Map<String, Object>) value);
    } else if (value instanceof Collection) {
      if (CollectionUtils.isEmpty((Collection<?>) value)) {
        result.put(name, value);
        return;
      }
      int index = 0;
      for (Object object : (Collection<Object>) value) {
        extract(name + "[" + index + "]", result, object);
        index++;
      }
    } else {
      result.put(name, value);
    }
  }


}
