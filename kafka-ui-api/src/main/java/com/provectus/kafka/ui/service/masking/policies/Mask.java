package com.provectus.kafka.ui.service.masking.policies;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ContainerNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.google.common.base.Preconditions;
import java.util.List;
import java.util.function.Function;

class Mask extends MaskingPolicy {

  private final Function<String, String> masker;

  Mask(List<String> fieldNames, List<Character> maskingChars) {
    super(fieldNames);
    this.masker = createMasker(maskingChars);
  }

  @Override
  public ContainerNode<?> applyToJsonContainer(ContainerNode<?> node) {
    return (ContainerNode<?>) maskWithFieldsCheck(node);
  }

  @Override
  public String applyToString(String str) {
    return masker.apply(str);
  }

  private static Function<String, String> createMasker(List<Character> maskingChars) {
    Preconditions.checkNotNull(maskingChars);
    Preconditions.checkArgument(maskingChars.size() == 4, "mask patter should contain of 4 elements");
    return input -> {
      StringBuilder sb = new StringBuilder(input.length());
      input.chars().forEach(ch -> {
        if (Character.isSpaceChar(ch)) {
          sb.appendCodePoint(ch); // keeping spaces and line separators as-is
        } else if (Character.isUpperCase(ch)) {
          sb.append(maskingChars.get(0));
        } else if (Character.isLowerCase(ch)) {
          sb.append(maskingChars.get(1));
        }  else if (Character.isDigit(ch)) {
          sb.append(maskingChars.get(2));
        } else {
          sb.append(maskingChars.get(3));
        }
      });
      return sb.toString();
    };
  }

  private JsonNode maskWithFieldsCheck(JsonNode node) {
    if (node.isObject()) {
      ObjectNode obj = ((ObjectNode) node).objectNode();
      node.fields().forEachRemaining(f -> {
        String fieldName = f.getKey();
        JsonNode fieldVal = f.getValue();
        if (fieldShouldBeMasked(fieldName)) {
          obj.set(fieldName, maskNodeRecursively(fieldVal));
        } else {
          obj.set(fieldName, maskWithFieldsCheck(fieldVal));
        }
      });
      return obj;
    } else if (node.isArray()) {
      ArrayNode arr = ((ArrayNode) node).arrayNode(node.size());
      node.elements().forEachRemaining(e -> arr.add(maskWithFieldsCheck(e)));
      return arr;
    }
    return node;
  }

  private JsonNode maskNodeRecursively(JsonNode node) {
    if (node.isObject()) {
      ObjectNode obj = ((ObjectNode) node).objectNode();
      node.fields().forEachRemaining(f -> obj.set(f.getKey(), maskNodeRecursively(f.getValue())));
      return obj;
    } else if (node.isArray()) {
      ArrayNode arr = ((ArrayNode) node).arrayNode(node.size());
      node.elements().forEachRemaining(e -> arr.add(maskNodeRecursively(e)));
      return arr;
    }
    return new TextNode(masker.apply(node.asText()));
  }
}
