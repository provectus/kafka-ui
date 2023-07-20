package com.provectus.kafka.ui.service.graphs;

import com.google.common.collect.Sets;
import com.provectus.kafka.ui.exception.ValidationException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.apache.commons.lang3.text.StrSubstitutor;

class PromQueryTemplate {

  private final String queryTemplate;
  private final Set<String> paramsNames;

  PromQueryTemplate(GraphDescription d) {
    this(d.prometheusQuery(), d.params());
  }

  PromQueryTemplate(String templateQueryString, Set<String> paramsNames) {
    this.queryTemplate = templateQueryString;
    this.paramsNames = paramsNames;
  }

  String getQuery(String clusterName, Map<String, String> paramValues) {
    var missingParams = Sets.difference(paramsNames, paramValues.keySet());
    if (!missingParams.isEmpty()) {
      throw new ValidationException("Not all params set for query, missing: " + missingParams);
    }
    Map<String, String> replacements = new HashMap<>(paramValues);
    replacements.put("cluster", clusterName);
    return replaceParams(replacements);
  }

  Optional<String> validateSyntax() {
    Map<String, String> fakeReplacements = new HashMap<>();
    fakeReplacements.put("cluster", "1");
    paramsNames.forEach(paramName -> fakeReplacements.put(paramName, "1"));

    String prepared = replaceParams(fakeReplacements);
    return PromQueryLangGrammar.validateExpression(prepared);
  }

  private String replaceParams(Map<String, String> replacements) {
    return new StrSubstitutor(replacements).replace(queryTemplate);
  }

}
