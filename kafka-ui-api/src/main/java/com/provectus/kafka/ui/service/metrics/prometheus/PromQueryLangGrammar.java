package com.provectus.kafka.ui.service.metrics.prometheus;

import com.provectus.kafka.ui.exception.ValidationException;
import java.util.Optional;
import org.antlr.v4.runtime.BaseErrorListener;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.RecognitionException;
import org.antlr.v4.runtime.Recognizer;
import promql.PromQLLexer;
import promql.PromQLParser;

class PromQueryLangGrammar {

  // returns error msg, or empty if query is valid
  static Optional<String> validateExpression(String query) {
    try {
      parseExpression(query);
      return Optional.empty();
    } catch (ValidationException v) {
      return Optional.of(v.getMessage());
    }
  }

  static PromQLParser.ExpressionContext parseExpression(String query) {
    return parse(query).expression();
  }

  private static PromQLParser parse(String str) throws ValidationException {
    PromQLLexer lexer = new PromQLLexer(CharStreams.fromString(str));
    lexer.addErrorListener(new BaseErrorListener() {
      @Override
      public void syntaxError(Recognizer<?, ?> recognizer, Object offendingSymbol,
                              int line, int charPositionInLine,
                              String msg, RecognitionException e) {
        throw new ValidationException("Invalid syntax: " + msg);
      }
    });
    CommonTokenStream tokenStream = new CommonTokenStream(lexer);
    return new PromQLParser(tokenStream);
  }

}
