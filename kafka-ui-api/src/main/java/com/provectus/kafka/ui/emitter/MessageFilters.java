package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.MessageFilterTypeDTO;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import groovy.json.JsonSlurper;
import java.util.function.Predicate;
import javax.annotation.Nullable;
import javax.script.CompiledScript;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.codehaus.groovy.jsr223.GroovyScriptEngineImpl;

@Slf4j
public class MessageFilters {

  private static GroovyScriptEngineImpl GROOVY_ENGINE;

  private MessageFilters() {
  }

  public static Predicate<TopicMessageDTO> createMsgFilter(String query, MessageFilterTypeDTO type) {
    switch (type) {
      case STRING_CONTAINS:
        return containsStringFilter(query);
      case GROOVY_SCRIPT:
        return groovyScriptFilter(query);
      default:
        throw new IllegalStateException("Unknown query type: " + type);
    }
  }

  static Predicate<TopicMessageDTO> containsStringFilter(String string) {
    return msg -> StringUtils.contains(msg.getKey(), string)
        || StringUtils.contains(msg.getContent(), string);
  }

  static Predicate<TopicMessageDTO> groovyScriptFilter(String script) {
    var compiledScript = compileScript(script);
    var jsonSlurper = new JsonSlurper();
    return msg -> {
      var bindings = getGroovyEngine().createBindings();
      bindings.put("partition", msg.getPartition());
      bindings.put("timestampMs", msg.getTimestamp().toInstant().toEpochMilli());
      bindings.put("keyAsText", msg.getKey());
      bindings.put("valueAsText", msg.getContent());
      bindings.put("headers", msg.getHeaders());
      bindings.put("key", parseToJsonOrReturnNull(jsonSlurper, msg.getKey()));
      bindings.put("value", parseToJsonOrReturnNull(jsonSlurper, msg.getContent()));
      try {
        var result = compiledScript.eval(bindings);
        if (result instanceof Boolean) {
          return (Boolean) result;
        }
        return false;
      } catch (Exception e) {
        log.trace("Error executing filter script '{}' on message '{}' ", script, msg, e);
        return false;
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
