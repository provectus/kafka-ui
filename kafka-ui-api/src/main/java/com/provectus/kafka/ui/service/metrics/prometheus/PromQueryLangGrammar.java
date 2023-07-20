package com.provectus.kafka.ui.service.metrics.prometheus;

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
    PromQLLexer lexer = new PromQLLexer(CharStreams.fromString(str));
    CommonTokenStream tokenStream = new CommonTokenStream(lexer);
    var parser = new PromQLParser(tokenStream);
    parser.removeErrorListeners();
    parser.setErrorHandler(new BailErrorStrategy());
    return parser;
  }

}
