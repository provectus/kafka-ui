package com.provectus.kafka.ui.service.metrics.scrape.prometheus;

import static io.prometheus.client.Collector.MetricFamilySamples.Sample;

import com.google.common.base.Enums;
import io.prometheus.client.Collector.MetricFamilySamples;
import io.prometheus.client.Collector.Type;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

public class PrometheusEndpointParser {

  // will be set if no TYPE provided (or it is unsupported)
  private static final Type DEFAULT_TYPE = Type.GAUGE;

  private PrometheusEndpointParser() {
  }

  private static class ParserContext {
    final List<MetricFamilySamples> registered = new ArrayList<>();

    String name;
    String help;
    Type type;
    String unit;
    Set<String> allowedNames = new HashSet<>();
    List<Sample> samples = new ArrayList<>();

    void registerAndReset() {
      if (!samples.isEmpty()) {
        registered.add(
            new MetricFamilySamples(
                name,
                Optional.ofNullable(unit).orElse(""),
                type,
                Optional.ofNullable(help).orElse(name),
                List.copyOf(samples))
        );
      }
      //resetting state:
      name = null;
      help = null;
      type = null;
      unit = null;
      allowedNames.clear();
      samples.clear();
    }

    List<MetricFamilySamples> getRegistered() {
      registerAndReset(); // last in progress metric should be registered
      return registered;
    }
  }

  // general logic taken from https://github.com/prometheus/client_python/blob/master/prometheus_client/parser.py
  public static List<MetricFamilySamples> parse(Stream<String> lines) {
    ParserContext context = new ParserContext();
    lines.map(String::trim)
        .filter(s -> !s.isBlank())
        .forEach(line -> {
          if (line.charAt(0) == '#') {
            String[] parts = line.split("[ \t]+", 4);
            if (parts.length >= 3) {
              switch (parts[1]) {
                case "HELP" -> processHelp(context, parts);
                case "TYPE" -> processType(context, parts);
                case "UNIT" -> processUnit(context, parts);
                default -> { /* probably a comment */ }
              }
            }
          } else {
            processSample(context, line);
          }
        });
    return context.getRegistered();
  }

  private static void processUnit(ParserContext context, String[] parts) {
    if (!parts[2].equals(context.name)) {
      // starting new metric family - need to register (if possible) prev one
      context.registerAndReset();
      context.name = parts[2];
      context.type = DEFAULT_TYPE;
      context.allowedNames.add(context.name);
    }
    if (parts.length == 4) {
      context.unit = parts[3];
    }
  }

  private static void processHelp(ParserContext context, String[] parts) {
    if (!parts[2].equals(context.name)) {
      // starting new metric family - need to register (if possible) prev one
      context.registerAndReset();
      context.name = parts[2];
      context.type = DEFAULT_TYPE;
      context.allowedNames.add(context.name);
    }
    if (parts.length == 4) {
      context.help = unescapeHelp(parts[3]);
    }
  }

  private static void processType(ParserContext context, String[] parts) {
    if (!parts[2].equals(context.name)) {
      // starting new metric family - need to register (if possible) prev one
      context.registerAndReset();
      context.name = parts[2];
    }

    context.type = Enums.getIfPresent(Type.class, parts[3].toUpperCase()).or(DEFAULT_TYPE);
    switch (context.type) {
      case SUMMARY -> {
        context.allowedNames.add(context.name);
        context.allowedNames.add(context.name + "_count");
        context.allowedNames.add(context.name + "_sum");
        context.allowedNames.add(context.name + "_created");
      }
      case HISTOGRAM -> {
        context.allowedNames.add(context.name + "_count");
        context.allowedNames.add(context.name + "_sum");
        context.allowedNames.add(context.name + "_bucket");
        context.allowedNames.add(context.name + "_created");
      }
      case COUNTER -> {
        context.allowedNames.add(context.name);
        context.allowedNames.add(context.name + "_total");
        context.allowedNames.add(context.name + "_created");
      }
      case INFO -> {
        context.allowedNames.add(context.name);
        context.allowedNames.add(context.name + "_info");
      }
      default -> context.allowedNames.add(context.name);
    }
  }

  private static void processSample(ParserContext context, String line) {
    parseSampleLine(line).ifPresent(sample -> {
      if (!context.allowedNames.contains(sample.name)) {
        // starting new metric family - need to register (if possible) prev one
        context.registerAndReset();
        context.name = sample.name;
        context.type = DEFAULT_TYPE;
        context.allowedNames.add(sample.name);
      }
      context.samples.add(sample);
    });
  }

  private static String unescapeHelp(String text) {
    // algorithm from https://github.com/prometheus/client_python/blob/a2dae6caeaf3c300db416ba10a2a3271693addd4/prometheus_client/parser.py
    if (text == null || !text.contains("\\")) {
      return text;
    }
    StringBuilder result = new StringBuilder();
    boolean slash = false;
    for (int c = 0; c < text.length(); c++) {
      char charAt = text.charAt(c);
      if (slash) {
        if (charAt == '\\') {
          result.append('\\');
        } else if (charAt == 'n') {
          result.append('\n');
        } else {
          result.append('\\').append(charAt);
        }
        slash = false;
      } else {
        if (charAt == '\\') {
          slash = true;
        } else {
          result.append(charAt);
        }
      }
    }
    if (slash) {
      result.append("\\");
    }
    return result.toString();
  }

  //returns empty if line is not valid sample string
  private static Optional<Sample> parseSampleLine(String line) {
    // algorithm copied from https://github.com/prometheus/client_python/blob/a2dae6caeaf3c300db416ba10a2a3271693addd4/prometheus_client/parser.py
    StringBuilder name = new StringBuilder();
    StringBuilder labelname = new StringBuilder();
    StringBuilder labelvalue = new StringBuilder();
    StringBuilder value = new StringBuilder();
    List<String> lblNames = new ArrayList<>();
    List<String> lblVals = new ArrayList<>();

    String state = "name";

    for (int c = 0; c < line.length(); c++) {
      char charAt = line.charAt(c);
      if (state.equals("name")) {
        if (charAt == '{') {
          state = "startoflabelname";
        } else if (charAt == ' ' || charAt == '\t') {
          state = "endofname";
        } else {
          name.append(charAt);
        }
      } else if (state.equals("endofname")) {
        if (charAt == ' ' || charAt == '\t') {
          // do nothing
        } else if (charAt == '{') {
          state = "startoflabelname";
        } else {
          value.append(charAt);
          state = "value";
        }
      } else if (state.equals("startoflabelname")) {
        if (charAt == ' ' || charAt == '\t') {
          // do nothing
        } else if (charAt == '}') {
          state = "endoflabels";
        } else {
          labelname.append(charAt);
          state = "labelname";
        }
      } else if (state.equals("labelname")) {
        if (charAt == '=') {
          state = "labelvaluequote";
        } else if (charAt == '}') {
          state = "endoflabels";
        } else if (charAt == ' ' || charAt == '\t') {
          state = "labelvalueequals";
        } else {
          labelname.append(charAt);
        }
      } else if (state.equals("labelvalueequals")) {
        if (charAt == '=') {
          state = "labelvaluequote";
        } else if (charAt == ' ' || charAt == '\t') {
          // do nothing
        } else {
          return Optional.empty();
        }
      } else if (state.equals("labelvaluequote")) {
        if (charAt == '"') {
          state = "labelvalue";
        } else if (charAt == ' ' || charAt == '\t') {
          // do nothing
        } else {
          return Optional.empty();
        }
      } else if (state.equals("labelvalue")) {
        if (charAt == '\\') {
          state = "labelvalueslash";
        } else if (charAt == '"') {
          lblNames.add(labelname.toString());
          lblVals.add(labelvalue.toString());
          labelname.setLength(0);
          labelvalue.setLength(0);
          state = "nextlabel";
        } else {
          labelvalue.append(charAt);
        }
      } else if (state.equals("labelvalueslash")) {
        state = "labelvalue";
        if (charAt == '\\') {
          labelvalue.append('\\');
        } else if (charAt == 'n') {
          labelvalue.append('\n');
        } else if (charAt == '"') {
          labelvalue.append('"');
        } else {
          labelvalue.append('\\').append(charAt);
        }
      } else if (state.equals("nextlabel")) {
        if (charAt == ',') {
          state = "labelname";
        } else if (charAt == '}') {
          state = "endoflabels";
        } else if (charAt == ' ' || charAt == '\t') {
          // do nothing
        } else {
          return Optional.empty();
        }
      } else if (state.equals("endoflabels")) {
        if (charAt == ' ' || charAt == '\t') {
          // do nothing
        } else {
          value.append(charAt);
          state = "value";
        }
      } else if (state.equals("value")) {
        if (charAt == ' ' || charAt == '\t') {
          break; // timestamps are NOT supported - ignoring
        } else {
          value.append(charAt);
        }
      }
    }
    return Optional.of(new Sample(name.toString(), lblNames, lblVals, parseDouble(value.toString())));
  }

  private static double parseDouble(String valueString) {
    if (valueString.equalsIgnoreCase("NaN")) {
      return Double.NaN;
    } else if (valueString.equalsIgnoreCase("+Inf")) {
      return Double.POSITIVE_INFINITY;
    } else if (valueString.equalsIgnoreCase("-Inf")) {
      return Double.NEGATIVE_INFINITY;
    }
    return Double.parseDouble(valueString);
  }


}

