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
    var compiledScript = compileScript(script);
    var jsonSlurper = new JsonSlurper();
    return new Predicate<TopicMessageDTO>() {
      @SneakyThrows
      @Override
      public boolean test(TopicMessageDTO msg) {
        var bindings = getGroovyEngine().createBindings();
        bindings.put("partition", msg.getPartition());
        bindings.put("offset", msg.getOffset());
        bindings.put("timestampMs", msg.getTimestamp().toInstant().toEpochMilli());
        bindings.put("keyAsText", msg.getKey());
        bindings.put("valueAsText", msg.getContent());
        bindings.put("headers", msg.getHeaders());
        bindings.put("key", parseToJsonOrReturnNull(jsonSlurper, msg.getKey()));
        bindings.put("value", parseToJsonOrReturnNull(jsonSlurper, msg.getContent()));
        var result = compiledScript.eval(bindings);
        if (result instanceof Boolean) {
          return (Boolean) result;
        } else {
          throw new ValidationException(
              String.format("Unexpected script result: %s, Boolean should be returned instead", result));
        }
      }
    };
  }

  @Nullable
  private static Object parseToJsonOrReturnNull(JsonSlurper parser, @Nullable String str) {
    if (str == null) {
      return null;
    }
    try {
      return parser.parseText(str);
    } catch (Exception e) {
      return null;
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

  private static CompiledScript compileScript(String script) {
    try {
      return getGroovyEngine().compile(script);
    } catch (ScriptException e) {
      throw new ValidationException("Script syntax error: " + e.getMessage());
    }
  }

}
