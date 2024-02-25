package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import groovy.json.JsonSlurper;
import java.util.function.Predicate;
import javax.annotation.Nullable;
import javax.script.CompiledScript;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.codehaus.groovy.jsr223.GroovyScriptEngineImpl;

@Slf4j
public class MessageFilters {

  private static GroovyScriptEngineImpl GROOVY_ENGINE;

  private MessageFilters() {
  }

  public static Predicate<TopicMessageDTO> noop() {
    return e -> true;
  }

  public static Predicate<TopicMessageDTO> containsStringFilter(String string) {
    return msg -> StringUtils.containsIgnoreCase(msg.getKey(), string)
        || StringUtils.containsIgnoreCase(msg.getContent(), string);
  }

  public static Predicate<TopicMessageDTO> groovyScriptFilter(String script) {
    var engine = getGroovyEngine();
    var compiledScript = compileScript(engine, script);
    var jsonSlurper = new JsonSlurper();
    return new Predicate<TopicMessageDTO>() {
      @SneakyThrows
      @Override
      public boolean test(TopicMessageDTO msg) {
        var bindings = engine.createBindings();
        bindings.put("partition", msg.getPartition());
        bindings.put("offset", msg.getOffset());
        bindings.put("timestampMs", msg.getTimestamp().toInstant().toEpochMilli());
        bindings.put("keyAsText", msg.getKey());
        bindings.put("valueAsText", msg.getContent());
        bindings.put("headers", msg.getHeaders());
        bindings.put("key", parseToJsonOrReturnAsIs(jsonSlurper, msg.getKey()));
        bindings.put("value", parseToJsonOrReturnAsIs(jsonSlurper, msg.getContent()));
        var result = compiledScript.eval(bindings);
        if (result instanceof Boolean) {
          return (Boolean) result;
        } else {
          throw new ValidationException(
              "Unexpected script result: %s, Boolean should be returned instead".formatted(result));
        }
      }
    };
  }

  @Nullable
  private static Object parseToJsonOrReturnAsIs(JsonSlurper parser, @Nullable String str) {
    if (str == null) {
      return null;
    }
    try {
      return parser.parseText(str);
    } catch (Exception e) {
      return str;
    }
  }

  private static synchronized GroovyScriptEngineImpl getGroovyEngine() {
    // it is pretty heavy object, so initializing it on-demand
    if (GROOVY_ENGINE == null) {
      GROOVY_ENGINE = (GroovyScriptEngineImpl)
          new ScriptEngineManager().getEngineByName("groovy");
    }
    return GROOVY_ENGINE;
  }

  private static CompiledScript compileScript(GroovyScriptEngineImpl engine, String script) {
    try {
      return engine.compile(script);
    } catch (ScriptException e) {
      throw new ValidationException("Script syntax error: " + e.getMessage());
    }
  }

}
