package com.provectus.kafka.ui.service.graphs;

import java.util.Optional;
import org.antlr.v4.runtime.BailErrorStrategy;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.misc.ParseCancellationException;
import promql.PromQLLexer;
import promql.PromQLParser;

class PromQueryLangGrammar {

  // returns error msg, or empty if query is valid
  static Optional<String> validateExpression(String query) {
    try {
      parseExpression(query);
      return Optional.empty();
    } catch (ParseCancellationException e) {
      //TODO: add more descriptive msg
      return Optional.of("Syntax error");
    }
  }

  static PromQLParser.ExpressionContext parseExpression(String query) {
    return createParser(query).expression();
  }

  private static PromQLParser createParser(String str) {
    var parser = new PromQLParser(new CommonTokenStream(new PromQLLexer(CharStreams.fromString(str))));
    parser.removeErrorListeners();
    parser.setErrorHandler(new BailErrorStrategy());
    return parser;
  }

}
