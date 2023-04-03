package com.provectus.kafka.ui.service.acl;

import com.provectus.kafka.ui.exception.ValidationException;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.apache.kafka.common.acl.AccessControlEntry;
import org.apache.kafka.common.acl.AclBinding;
import org.apache.kafka.common.acl.AclOperation;
import org.apache.kafka.common.acl.AclPermissionType;
import org.apache.kafka.common.resource.PatternType;
import org.apache.kafka.common.resource.ResourcePattern;
import org.apache.kafka.common.resource.ResourceType;

public class AclCsv {

  private static final String LINE_SEPARATOR = System.lineSeparator();
  private static final String VALUES_SEPARATOR = ",";
  private static final String HEADER = "Principal,ResourceType,PatternType,ResourceName,Operation,PermissionType,Host";

  public static String transformToCsvString(Collection<AclBinding> acls) {
    return Stream.concat(Stream.of(HEADER), acls.stream().map(AclCsv::createAclString))
        .collect(Collectors.joining(System.lineSeparator()));
  }

  public static String createAclString(AclBinding binding) {
    var pattern = binding.pattern();
    var filter  = binding.toFilter().entryFilter();
    return String.format(
        "%s,%s,%s,%s,%s,%s,%s",
        filter.principal(),
        pattern.resourceType(),
        pattern.patternType(),
        pattern.name(),
        filter.operation(),
        filter.permissionType(),
        filter.host()
    );
  }

  private static AclBinding parseCsvLine(String csv, int line) {
    String[] values = csv.split(VALUES_SEPARATOR);
    if (values.length != 7) {
      throw new ValidationException("Input csv is not valid - there should be 7 columns in line " + line);
    }
    for (int i = 0; i < values.length; i++) {
      if ((values[i] = values[i].trim()).isBlank()) {
        throw new ValidationException("Input csv is not valid - blank value in colum " + i + ", line " + line);
      }
    }
    try {
      return new AclBinding(
          new ResourcePattern(
              ResourceType.valueOf(values[1]), values[3], PatternType.valueOf(values[2])),
          new AccessControlEntry(
              values[0], values[6], AclOperation.valueOf(values[4]), AclPermissionType.valueOf(values[5]))
      );
    } catch (IllegalArgumentException enumParseError) {
      throw new ValidationException("Error parsing enum value in line " + line);
    }
  }

  public static Collection<AclBinding> parseCsv(String csvString) {
    String[] lines = csvString.split(LINE_SEPARATOR);
    if (lines.length == 0) {
      throw new ValidationException("Error parsing ACL csv file: no lines in file");
    }
    boolean firstLineIsHeader = HEADER.equalsIgnoreCase(lines[0].trim().replace(" ", ""));
    Set<AclBinding> result = new HashSet<>();
    for (int i = firstLineIsHeader ? 1 : 0; i < lines.length; i++) {
      String line = lines[i];
      if (!line.isBlank()) {
        AclBinding aclBinding = parseCsvLine(line, i);
        result.add(aclBinding);
      }
    }
    return result;
  }
}
