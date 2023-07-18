package com.provectus.kafka.ui.service.metrics.prometheus;

import com.provectus.kafka.ui.exception.ValidationException;
import org.antlr.v4.runtime.BaseErrorListener;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.RecognitionException;
import org.antlr.v4.runtime.Recognizer;
import promql.PromQLLexer;
import promql.PromQLParser;

public class PromQlGrammar {

  public static void main(String[] args) {
    String promql = "sum( " +
        "        kafka_controller_kafkacontroller_activecontrollercount{cluster_name=\"3299fef4\",metrics=\"kafka\"}) OR " +
        "        kafka_controller_kafkacontroller_activecontrollercount{cluster_name=\"3299fef4\",job=\"topic-scanner\"}";
    System.out.println(parseMetricSelector(promql));
  }

  public static PromQLParser.InstantSelectorContext parseMetricSelector(String selector) {
    return parse(selector).instantSelector();
  }

  public static PromQLParser.ExpressionContext parseExpression(String query) {
    return parse(query).expression();
  }

  private static PromQLParser parse(String str) {
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
