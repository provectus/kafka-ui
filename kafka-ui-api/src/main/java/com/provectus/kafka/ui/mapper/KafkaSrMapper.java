package com.provectus.kafka.ui.mapper;

import com.provectus.kafka.ui.model.CompatibilityCheckResponseDTO;
import com.provectus.kafka.ui.model.CompatibilityLevelDTO;
import com.provectus.kafka.ui.model.NewSchemaSubjectDTO;
import com.provectus.kafka.ui.model.SchemaReferenceDTO;
import com.provectus.kafka.ui.model.SchemaSubjectDTO;
import com.provectus.kafka.ui.model.SchemaTypeDTO;
import com.provectus.kafka.ui.service.SchemaRegistryService;
import com.provectus.kafka.ui.sr.model.Compatibility;
import com.provectus.kafka.ui.sr.model.CompatibilityCheckResponse;
import com.provectus.kafka.ui.sr.model.NewSubject;
import com.provectus.kafka.ui.sr.model.SchemaReference;
import com.provectus.kafka.ui.sr.model.SchemaType;
import java.util.List;
import java.util.Optional;
import org.mapstruct.Mapper;


@Mapper
public interface KafkaSrMapper {

  default SchemaSubjectDTO toDto(SchemaRegistryService.SubjectWithCompatibilityLevel s) {
    return new SchemaSubjectDTO()
        .id(s.getId())
        .version(s.getVersion())
        .subject(s.getSubject())
        .schema(s.getSchema())
        .schemaType(SchemaTypeDTO.fromValue(Optional.ofNullable(s.getSchemaType()).orElse(SchemaType.AVRO).getValue()))
        .references(toDto(s.getReferences()))
        .compatibilityLevel(s.getCompatibility().toString());
  }

  List<SchemaReferenceDTO> toDto(List<SchemaReference> references);

  CompatibilityCheckResponseDTO toDto(CompatibilityCheckResponse ccr);

  CompatibilityLevelDTO.CompatibilityEnum toDto(Compatibility compatibility);

  NewSubject fromDto(NewSchemaSubjectDTO subjectDto);

  Compatibility fromDto(CompatibilityLevelDTO.CompatibilityEnum dtoEnum);
}
