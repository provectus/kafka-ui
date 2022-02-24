package com.provectus.kafka.ui.service.ksql;

import com.provectus.kafka.ui.exception.ValidationException;
import java.util.List;
import ksql.KsqlGrammarLexer;
import ksql.KsqlGrammarParser;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.experimental.Delegate;
import org.antlr.v4.runtime.BaseErrorListener;
import org.antlr.v4.runtime.CharStream;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.IntStream;
import org.antlr.v4.runtime.RecognitionException;
import org.antlr.v4.runtime.Recognizer;
import org.antlr.v4.runtime.atn.PredictionMode;

class KsqlGrammar {

  private KsqlGrammar() {
  }

  @Value
  static class KsqlStatements {
    List<KsqlGrammarParser.SingleStatementContext> statements;
  }

  static KsqlStatements parse(String ksql) {
    var parsed = parseStatements(ksql);
    if (parsed.singleStatement().stream()
        .anyMatch(s -> s.statement().exception != null)) {
      throw new ValidationException("Error parsing ksql statement. Check syntax!");
    }
    return new KsqlStatements(parsed.singleStatement());
  }

  static boolean isSelect(KsqlGrammarParser.SingleStatementContext statement) {
    return statement.statement() instanceof ksql.KsqlGrammarParser.QueryStatementContext;
  }

  private static ksql.KsqlGrammarParser.StatementsContext parseStatements(final String sql) {
    var lexer = new KsqlGrammarLexer(CaseInsensitiveStream.from(CharStreams.fromString(sql)));
    var tokenStream = new CommonTokenStream(lexer);
    var grammarParser = new ksql.KsqlGrammarParser(tokenStream);

    lexer.addErrorListener(new BaseErrorListener() {
      @Override
      public void syntaxError(Recognizer<?, ?> recognizer, Object offendingSymbol,
                              int line, int charPositionInLine,
                              String msg, RecognitionException e) {
        throw new ValidationException("Invalid syntax: " + msg);
      }
    });
    grammarParser.getInterpreter().setPredictionMode(PredictionMode.LL);
    try {
      return grammarParser.statements();
    } catch (Exception e) {
      throw new ValidationException("Error parsing ksql query: " + e.getMessage());
    }
  }

  // impl copied from https://github.com/confluentinc/ksql/blob/master/ksqldb-parser/src/main/java/io/confluent/ksql/parser/CaseInsensitiveStream.java
  @RequiredArgsConstructor
  private static class CaseInsensitiveStream implements CharStream {
    @Delegate
    final CharStream stream;

    public static CaseInsensitiveStream from(CharStream stream) {
      // we only need to override LA method
      return new CaseInsensitiveStream(stream) {
        @Override
        public int LA(final int i) {
          final int result = stream.LA(i);
          switch (result) {
            case 0:
            case IntStream.EOF:
              return result;
            default:
              return Character.toUpperCase(result);
          }
        }
      };
    }
  }
}
