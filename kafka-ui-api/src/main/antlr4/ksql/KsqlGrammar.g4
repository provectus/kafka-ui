grammar KsqlGrammar;

tokens {
    DELIMITER
}

@lexer::members {
    public static final int COMMENTS = 2;
    public static final int WHITESPACE = 3;
    public static final int DIRECTIVES = 4;
}

statements
    : (singleStatement)* EOF
    ;

testStatement
    : (singleStatement | assertStatement ';' | runScript ';') EOF?
    ;

singleStatement
    : statement ';'
    ;

singleExpression
    : expression EOF
    ;

statement
    : query                                                                 #queryStatement
    | (LIST | SHOW) PROPERTIES                                              #listProperties
    | (LIST | SHOW) ALL? TOPICS EXTENDED?                                   #listTopics
    | (LIST | SHOW) STREAMS EXTENDED?                                       #listStreams
    | (LIST | SHOW) TABLES EXTENDED?                                        #listTables
    | (LIST | SHOW) FUNCTIONS                                               #listFunctions
    | (LIST | SHOW) (SOURCE | SINK)? CONNECTORS                             #listConnectors
    | (LIST | SHOW) CONNECTOR PLUGINS                                       #listConnectorPlugins
    | (LIST | SHOW) TYPES                                                   #listTypes
    | (LIST | SHOW) VARIABLES                                               #listVariables
    | DESCRIBE sourceName EXTENDED?                                         #showColumns
    | DESCRIBE STREAMS EXTENDED?                                            #describeStreams
    | DESCRIBE FUNCTION identifier                                          #describeFunction
    | DESCRIBE CONNECTOR identifier                                         #describeConnector
    | PRINT (identifier| STRING) printClause                                #printTopic
    | (LIST | SHOW) QUERIES EXTENDED?                                       #listQueries
    | TERMINATE identifier                                                  #terminateQuery
    | TERMINATE ALL                                                         #terminateQuery
    | SET STRING EQ STRING                                                  #setProperty
    | UNSET STRING                                                          #unsetProperty
    | DEFINE variableName EQ variableValue                                  #defineVariable
    | UNDEFINE variableName                                                 #undefineVariable
    | CREATE (OR REPLACE)? (SOURCE)? STREAM (IF NOT EXISTS)? sourceName
                (tableElements)?
                (WITH tableProperties)?                                     #createStream
    | CREATE (OR REPLACE)? STREAM (IF NOT EXISTS)? sourceName
            (WITH tableProperties)? AS query                                #createStreamAs
    | CREATE (OR REPLACE)? (SOURCE)? TABLE (IF NOT EXISTS)? sourceName
                    (tableElements)?
                    (WITH tableProperties)?                                 #createTable
    | CREATE (OR REPLACE)? TABLE (IF NOT EXISTS)? sourceName
            (WITH tableProperties)? AS query                                #createTableAs
    | CREATE (SINK | SOURCE) CONNECTOR (IF NOT EXISTS)? identifier
             WITH tableProperties                                           #createConnector
    | INSERT INTO sourceName (WITH tableProperties)? query                  #insertInto
    | INSERT INTO sourceName (columns)? VALUES values                       #insertValues
    | DROP STREAM (IF EXISTS)? sourceName (DELETE TOPIC)?                   #dropStream
    | DROP TABLE (IF EXISTS)? sourceName (DELETE TOPIC)?                    #dropTable
    | DROP CONNECTOR (IF EXISTS)? identifier                                #dropConnector
    | EXPLAIN  (statement | identifier)                                     #explain
    | CREATE TYPE (IF NOT EXISTS)? identifier AS type                       #registerType
    | DROP TYPE (IF EXISTS)? identifier                                     #dropType
    | ALTER (STREAM | TABLE) sourceName alterOption (',' alterOption)*      #alterSource
    ;

assertStatement
    : ASSERT VALUES sourceName (columns)? VALUES values                     #assertValues
    | ASSERT NULL VALUES sourceName (columns)? KEY values                   #assertTombstone
    | ASSERT STREAM sourceName (tableElements)? (WITH tableProperties)?     #assertStream
    | ASSERT TABLE sourceName (tableElements)? (WITH tableProperties)?      #assertTable
    ;

runScript
    : RUN SCRIPT STRING
    ;

query
    : SELECT selectItem (',' selectItem)*
      FROM from=relation
      (WINDOW  windowExpression)?
      (WHERE where=booleanExpression)?
      (GROUP BY groupBy)?
      (PARTITION BY partitionBy)?
      (HAVING having=booleanExpression)?
      (EMIT resultMaterialization)?
      limitClause?
    ;

resultMaterialization
    : CHANGES
    | FINAL
    ;

alterOption
    : ADD (COLUMN)? identifier type
    ;

tableElements
    : '(' tableElement (',' tableElement)* ')'
    ;

tableElement
    : identifier type columnConstraints?
    ;

columnConstraints
    : ((PRIMARY)? KEY)
    | HEADERS
    | HEADER '(' STRING ')'
    ;

tableProperties
    : '(' tableProperty (',' tableProperty)* ')'
    ;

tableProperty
    : (identifier | STRING) EQ literal
    ;

printClause
      : (FROM BEGINNING)? intervalClause? limitClause?
      ;

intervalClause
    : (INTERVAL | SAMPLE) number
    ;

limitClause
    : LIMIT number
    ;

retentionClause
    : RETENTION number windowUnit
    ;

gracePeriodClause
    : GRACE PERIOD number windowUnit
    ;

windowExpression
    : (IDENTIFIER)?
     ( tumblingWindowExpression | hoppingWindowExpression | sessionWindowExpression )
    ;

tumblingWindowExpression
    : TUMBLING '(' SIZE number windowUnit (',' retentionClause)? (',' gracePeriodClause)?')'
    ;

hoppingWindowExpression
    : HOPPING '(' SIZE number windowUnit ',' ADVANCE BY number windowUnit (',' retentionClause)? (',' gracePeriodClause)?')'
    ;

sessionWindowExpression
    : SESSION '(' number windowUnit (',' retentionClause)? (',' gracePeriodClause)?')'
    ;

windowUnit
    : DAY
    | HOUR
    | MINUTE
    | SECOND
    | MILLISECOND
    | DAYS
    | HOURS
    | MINUTES
    | SECONDS
    | MILLISECONDS
    ;

groupBy
    : valueExpression (',' valueExpression)*
    | '(' (valueExpression (',' valueExpression)*)? ')'
    ;

partitionBy
    : valueExpression (',' valueExpression)*
    | '(' (valueExpression (',' valueExpression)*)? ')'
    ;

values
    : '(' (valueExpression (',' valueExpression)*)? ')'
    ;

selectItem
    : expression (AS? identifier)?  #selectSingle
    | identifier '.' ASTERISK       #selectAll
    | ASTERISK                      #selectAll
    ;

relation
    : left=aliasedRelation joinedSource+  #joinRelation
    | aliasedRelation                     #relationDefault
    ;

joinedSource
    : joinType JOIN aliasedRelation joinWindow? joinCriteria
    ;

joinType
    : INNER? #innerJoin
    | FULL OUTER? #outerJoin
    | LEFT OUTER? #leftJoin
    ;

joinWindow
    : WITHIN withinExpression
    ;

withinExpression
    : '(' joinWindowSize ',' joinWindowSize ')' (gracePeriodClause)?  # joinWindowWithBeforeAndAfter
    | joinWindowSize (gracePeriodClause)?                             # singleJoinWindow
    ;

joinWindowSize
    : number windowUnit
    ;

joinCriteria
    : ON booleanExpression
    ;

aliasedRelation
    : relationPrimary (AS? sourceName)?
    ;

columns
    : '(' identifier (',' identifier)* ')'
    ;

relationPrimary
    : sourceName                                                  #tableName
    ;

expression
    : booleanExpression
    ;

booleanExpression
    : predicated                                                   #booleanDefault
    | NOT booleanExpression                                        #logicalNot
    | left=booleanExpression operator=AND right=booleanExpression  #logicalBinary
    | left=booleanExpression operator=OR right=booleanExpression   #logicalBinary
    ;

predicated
    : valueExpression predicate[$valueExpression.ctx]?
    ;

predicate[ParserRuleContext value]
    : comparisonOperator right=valueExpression                            #comparison
    | NOT? BETWEEN lower=valueExpression AND upper=valueExpression        #between
    | NOT? IN '(' expression (',' expression)* ')'                        #inList
    | NOT? LIKE pattern=valueExpression	(ESCAPE escape=STRING)?   		    #like
    | IS NOT? NULL                                                        #nullPredicate
    | IS NOT? DISTINCT FROM right=valueExpression                         #distinctFrom
    ;

valueExpression
    : primaryExpression                                                                 #valueExpressionDefault
    | valueExpression AT timeZoneSpecifier                                              #atTimeZone
    | operator=(MINUS | PLUS) valueExpression                                           #arithmeticUnary
    | left=valueExpression operator=(ASTERISK | SLASH | PERCENT) right=valueExpression  #arithmeticBinary
    | left=valueExpression operator=(PLUS | MINUS) right=valueExpression                #arithmeticBinary
    | left=valueExpression CONCAT right=valueExpression                                 #concatenation
    ;

primaryExpression
    : literal                                                                             #literalExpression
    | identifier STRING                                                                   #typeConstructor
    | CASE valueExpression whenClause+ (ELSE elseExpression=expression)? END              #simpleCase
    | CASE whenClause+ (ELSE elseExpression=expression)? END                              #searchedCase
    | CAST '(' expression AS type ')'                                                     #cast
    | ARRAY '[' (expression (',' expression)*)? ']'                                       #arrayConstructor
    | MAP '(' (expression ASSIGN expression (',' expression ASSIGN expression)*)? ')'     #mapConstructor
    | STRUCT '(' (identifier ASSIGN expression (',' identifier ASSIGN expression)*)? ')'  #structConstructor
    | identifier '(' ASTERISK ')'                              		                        #functionCall
    | identifier '(' (functionArgument (',' functionArgument)* (',' lambdaFunction)*)? ')' #functionCall
    | value=primaryExpression '[' index=valueExpression ']'                               #subscript
    | identifier                                                                          #columnReference
    | identifier '.' identifier                                                           #qualifiedColumnReference
    | base=primaryExpression STRUCT_FIELD_REF fieldName=identifier                        #dereference
    | '(' expression ')'                                                                  #parenthesizedExpression
    ;

functionArgument
    : expression
    | windowUnit
    ;

timeZoneSpecifier
    : TIME ZONE STRING    #timeZoneString
    ;

comparisonOperator
    : EQ | NEQ | LT | LTE | GT | GTE
    ;

booleanValue
    : TRUE | FALSE
    ;

type
    : type ARRAY
    | ARRAY '<' type '>'
    | MAP '<' type ',' type '>'
    | STRUCT '<' (identifier type (',' identifier type)*)? '>'
    | DECIMAL '(' number ',' number ')'
    | baseType ('(' typeParameter (',' typeParameter)* ')')?
    ;

typeParameter
    : INTEGER_VALUE | 'STRING'
    ;

baseType
    : identifier
    ;

whenClause
    : WHEN condition=expression THEN result=expression
    ;

identifier
    : VARIABLE               #variableIdentifier
    | IDENTIFIER             #unquotedIdentifier
    | QUOTED_IDENTIFIER      #quotedIdentifierAlternative
    | nonReserved            #unquotedIdentifier
    | BACKQUOTED_IDENTIFIER  #backQuotedIdentifier
    | DIGIT_IDENTIFIER       #digitIdentifier
    ;

lambdaFunction
    :  identifier '=>' expression                            #lambda
    | '(' identifier (',' identifier)*  ')' '=>' expression  #lambda
    ;

variableName
    : IDENTIFIER
    ;

variableValue
    : STRING
    ;

sourceName
    : identifier
    ;

number
    : MINUS? DECIMAL_VALUE         #decimalLiteral
    | MINUS? FLOATING_POINT_VALUE  #floatLiteral
    | MINUS? INTEGER_VALUE         #integerLiteral
    ;

literal
    : NULL                                                                           #nullLiteral
    | number                                                                         #numericLiteral
    | booleanValue                                                                   #booleanLiteral
    | STRING                                                                         #stringLiteral
    | VARIABLE                                                                       #variableLiteral
    ;

nonReserved
    : SHOW | TABLES | COLUMNS | COLUMN | PARTITIONS | FUNCTIONS | FUNCTION | SESSION
    | STRUCT | MAP | ARRAY | PARTITION
    | INTEGER | DATE | TIME | TIMESTAMP | INTERVAL | ZONE | 'STRING'
    | YEAR | MONTH | DAY | HOUR | MINUTE | SECOND
    | EXPLAIN | ANALYZE | TYPE | TYPES
    | SET | RESET
    | IF
    | SOURCE | SINK
    | PRIMARY | KEY
    | EMIT
    | CHANGES
    | FINAL
    | ESCAPE
    | REPLACE
    | ASSERT
    | ALTER
    | ADD
    ;

EMIT: 'EMIT';
CHANGES: 'CHANGES';
FINAL: 'FINAL';
SELECT: 'SELECT';
FROM: 'FROM';
AS: 'AS';
ALL: 'ALL';
DISTINCT: 'DISTINCT';
WHERE: 'WHERE';
WITHIN: 'WITHIN';
WINDOW: 'WINDOW';
GROUP: 'GROUP';
BY: 'BY';
HAVING: 'HAVING';
LIMIT: 'LIMIT';
AT: 'AT';
OR: 'OR';
AND: 'AND';
IN: 'IN';
NOT: 'NOT';
EXISTS: 'EXISTS';
BETWEEN: 'BETWEEN';
LIKE: 'LIKE';
ESCAPE: 'ESCAPE';
IS: 'IS';
NULL: 'NULL';
TRUE: 'TRUE';
FALSE: 'FALSE';
INTEGER: 'INTEGER';
DATE: 'DATE';
TIME: 'TIME';
TIMESTAMP: 'TIMESTAMP';
INTERVAL: 'INTERVAL';
YEAR: 'YEAR';
MONTH: 'MONTH';
DAY: 'DAY';
HOUR: 'HOUR';
MINUTE: 'MINUTE';
SECOND: 'SECOND';
MILLISECOND: 'MILLISECOND';
YEARS: 'YEARS';
MONTHS: 'MONTHS';
DAYS: 'DAYS';
HOURS: 'HOURS';
MINUTES: 'MINUTES';
SECONDS: 'SECONDS';
MILLISECONDS: 'MILLISECONDS';
ZONE: 'ZONE';
TUMBLING: 'TUMBLING';
HOPPING: 'HOPPING';
SIZE: 'SIZE';
ADVANCE: 'ADVANCE';
RETENTION: 'RETENTION';
GRACE: 'GRACE';
PERIOD: 'PERIOD';
CASE: 'CASE';
WHEN: 'WHEN';
THEN: 'THEN';
ELSE: 'ELSE';
END: 'END';
JOIN: 'JOIN';
FULL: 'FULL';
OUTER: 'OUTER';
INNER: 'INNER';
LEFT: 'LEFT';
RIGHT: 'RIGHT';
ON: 'ON';
PARTITION: 'PARTITION';
STRUCT: 'STRUCT';
WITH: 'WITH';
VALUES: 'VALUES';
CREATE: 'CREATE';
TABLE: 'TABLE';
TOPIC: 'TOPIC';
STREAM: 'STREAM';
STREAMS: 'STREAMS';
INSERT: 'INSERT';
DELETE: 'DELETE';
INTO: 'INTO';
DESCRIBE: 'DESCRIBE';
EXTENDED: 'EXTENDED';
PRINT: 'PRINT';
EXPLAIN: 'EXPLAIN';
ANALYZE: 'ANALYZE';
TYPE: 'TYPE';
TYPES: 'TYPES';
CAST: 'CAST';
SHOW: 'SHOW';
LIST: 'LIST';
TABLES: 'TABLES';
TOPICS: 'TOPICS';
QUERY: 'QUERY';
QUERIES: 'QUERIES';
TERMINATE: 'TERMINATE';
LOAD: 'LOAD';
COLUMNS: 'COLUMNS';
COLUMN: 'COLUMN';
PARTITIONS: 'PARTITIONS';
FUNCTIONS: 'FUNCTIONS';
FUNCTION: 'FUNCTION';
DROP: 'DROP';
TO: 'TO';
RENAME: 'RENAME';
ARRAY: 'ARRAY';
MAP: 'MAP';
SET: 'SET';
DEFINE: 'DEFINE';
UNDEFINE: 'UNDEFINE';
RESET: 'RESET';
SESSION: 'SESSION';
SAMPLE: 'SAMPLE';
EXPORT: 'EXPORT';
CATALOG: 'CATALOG';
PROPERTIES: 'PROPERTIES';
BEGINNING: 'BEGINNING';
UNSET: 'UNSET';
RUN: 'RUN';
SCRIPT: 'SCRIPT';
DECIMAL: 'DECIMAL';
KEY: 'KEY';
CONNECTOR: 'CONNECTOR';
CONNECTORS: 'CONNECTORS';
SINK: 'SINK';
SOURCE: 'SOURCE';
NAMESPACE: 'NAMESPACE';
MATERIALIZED: 'MATERIALIZED';
VIEW: 'VIEW';
PRIMARY: 'PRIMARY';
REPLACE: 'REPLACE';
ASSERT: 'ASSERT';
ADD: 'ADD';
ALTER: 'ALTER';
VARIABLES: 'VARIABLES';
PLUGINS: 'PLUGINS';
HEADERS: 'HEADERS';
HEADER: 'HEADER';

IF: 'IF';

EQ  : '=';
NEQ : '<>' | '!=';
LT  : '<';
LTE : '<=';
GT  : '>';
GTE : '>=';

PLUS: '+';
MINUS: '-';
ASTERISK: '*';
SLASH: '/';
PERCENT: '%';
CONCAT: '||';

ASSIGN: ':=';
STRUCT_FIELD_REF: '->';

LAMBDA_EXPRESSION: '=>';

STRING
    : '\'' ( ~'\'' | '\'\'' )* '\''
    ;

INTEGER_VALUE
    : DIGIT+
    ;

DECIMAL_VALUE
    : DIGIT+ '.' DIGIT*
    | '.' DIGIT+
    ;

FLOATING_POINT_VALUE
    : DIGIT+ ('.' DIGIT*)? EXPONENT
    | '.' DIGIT+ EXPONENT
    ;

IDENTIFIER
    : (LETTER | '_') (LETTER | DIGIT | '_' | '@' )*
    ;

DIGIT_IDENTIFIER
    : DIGIT (LETTER | DIGIT | '_' | '@' )+
    ;

QUOTED_IDENTIFIER
    : '"' ( ~'"' | '""' )* '"'
    ;

BACKQUOTED_IDENTIFIER
    : '`' ( ~'`' | '``' )* '`'
    ;

VARIABLE
    : '${' IDENTIFIER '}'
    ;

fragment EXPONENT
    : 'E' [+-]? DIGIT+
    ;

fragment DIGIT
    : [0-9]
    ;

fragment LETTER
    : [A-Z]
    ;

SIMPLE_COMMENT
    : '--' ~'@' ~[\r\n]* '\r'? '\n'? -> channel(2) // channel(COMMENTS)
    ;

DIRECTIVE_COMMENT
    : '--@' ~[\r\n]* '\r'? '\n'? -> channel(4) // channel(DIRECTIVES)
    ;

BRACKETED_COMMENT
    : '/*' .*? '*/' -> channel(2) // channel(COMMENTS)
    ;

WS
    : [ \r\n\t]+ -> channel(3) // channel(WHITESPACE)
    ;

// Catch-all for anything we can't recognize.
// We use this to be able to ignore and recover all the text
// when splitting statements with DelimiterLexer
UNRECOGNIZED
    : .
    ;
