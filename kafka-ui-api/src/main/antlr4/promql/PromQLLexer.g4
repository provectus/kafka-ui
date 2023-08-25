lexer grammar PromQLLexer;

channels { WHITESPACE, COMMENTS }

// All keywords in PromQL are case insensitive, it is just function,
// label and metric names that are not.
options { caseInsensitive=true; }

fragment NUMERAL: [0-9]+ ('.' [0-9]+)?;

fragment SCIENTIFIC_NUMBER
   : NUMERAL ('e' [-+]? NUMERAL)?
   ;

NUMBER
    : NUMERAL
    | SCIENTIFIC_NUMBER;

STRING
    : '\'' (~('\'' | '\\') | '\\' .)* '\''
    | '"' (~('"' | '\\') | '\\' .)* '"'
    ;

// Binary operators

ADD:  '+';
SUB:  '-';
MULT: '*';
DIV:  '/';
MOD:  '%';
POW:  '^';

AND:    'and';
OR:     'or';
UNLESS: 'unless';

// Comparison operators

EQ:  '=';
DEQ: '==';
NE:  '!=';
GT:  '>';
LT:  '<';
GE:  '>=';
LE:  '<=';
RE:  '=~';
NRE: '!~';

// Aggregation modifiers

BY:      'by';
WITHOUT: 'without';

// Join modifiers

ON:          'on';
IGNORING:    'ignoring';
GROUP_LEFT:  'group_left';
GROUP_RIGHT: 'group_right';

OFFSET: 'offset';

BOOL: 'bool';

AGGREGATION_OPERATOR
    : 'sum'
    | 'min'
    | 'max'
    | 'avg'
    | 'group'
    | 'stddev'
    | 'stdvar'
    | 'count'
    | 'count_values'
    | 'bottomk'
    | 'topk'
    | 'quantile'
    ;

FUNCTION options { caseInsensitive=false; }
    : 'abs'
    | 'absent'
    | 'absent_over_time'
    | 'ceil'
    | 'changes'
    | 'clamp_max'
    | 'clamp_min'
    | 'day_of_month'
    | 'day_of_week'
    | 'days_in_month'
    | 'delta'
    | 'deriv'
    | 'exp'
    | 'floor'
    | 'histogram_quantile'
    | 'holt_winters'
    | 'hour'
    | 'idelta'
    | 'increase'
    | 'irate'
    | 'label_join'
    | 'label_replace'
    | 'ln'
    | 'log2'
    | 'log10'
    | 'minute'
    | 'month'
    | 'predict_linear'
    | 'rate'
    | 'resets'
    | 'round'
    | 'scalar'
    | 'sort'
    | 'sort_desc'
    | 'sqrt'
    | 'time'
    | 'timestamp'
    | 'vector'
    | 'year'
    | 'avg_over_time'
    | 'min_over_time'
    | 'max_over_time'
    | 'sum_over_time'
    | 'count_over_time'
    | 'quantile_over_time'
    | 'stddev_over_time'
    | 'stdvar_over_time'
    | 'last_over_time'
    | 'acos'
    | 'acosh'
    | 'asin'
    | 'asinh'
    | 'atan'
    | 'atanh'
    | 'cos'
    | 'cosh'
    | 'sin'
    | 'sinh'
    | 'tan'
    | 'tanh'
    | 'deg'
    | 'pi'
    | 'rad'
    ;

LEFT_BRACE:  '{';
RIGHT_BRACE: '}';

LEFT_PAREN:  '(';
RIGHT_PAREN: ')';

LEFT_BRACKET:  '[';
RIGHT_BRACKET: ']';

COMMA: ',';

AT: '@';

SUBQUERY_RANGE
     : LEFT_BRACKET DURATION ':' DURATION? RIGHT_BRACKET;

TIME_RANGE
    : LEFT_BRACKET DURATION RIGHT_BRACKET;

// The proper order (longest to the shortest) must be validated after parsing
DURATION: ([0-9]+ ('ms' | [smhdwy]))+;

METRIC_NAME: [a-z_:] [a-z0-9_:]*;
LABEL_NAME:  [a-z_] [a-z0-9_]*;



WS: [\r\t\n ]+ -> channel(WHITESPACE);
SL_COMMENT
    : '#' .*? '\n' -> channel(COMMENTS)
    ;
