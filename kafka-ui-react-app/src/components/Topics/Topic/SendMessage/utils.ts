import {
  Partition,
  SerdeDescription,
  TopicSerdeSuggestion,
} from 'generated-sources';
import jsf from 'json-schema-faker';
import { compact } from 'lodash';
import Ajv, { DefinedError } from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import * as draft6MetaSchema from 'ajv/dist/refs/json-schema-draft-06.json';
import AjvDraft4 from 'ajv-draft-04';
import addFormats from 'ajv-formats';
import upperFirst from 'lodash/upperFirst';

jsf.option('fillProperties', false);
jsf.option('alwaysFakeOptionals', true);
jsf.option('failOnInvalidFormat', false);

const generateValueFromSchema = (preferred?: SerdeDescription) => {
  if (!preferred?.schema) {
    return undefined;
  }
  const parsedSchema = JSON.parse(preferred.schema);
  const value = jsf.generate(parsedSchema);
  return JSON.stringify(value);
};

export const getPreferredDescription = (serdes: SerdeDescription[]) =>
  serdes.find((s) => s.preferred);

export const getDefaultValues = (serdes: TopicSerdeSuggestion) => {
  const keySerde = getPreferredDescription(serdes.key || []);
  const valueSerde = getPreferredDescription(serdes.value || []);

  return {
    key: generateValueFromSchema(keySerde),
    content: generateValueFromSchema(valueSerde),
    headers: undefined,
    partition: undefined,
    keySerde: keySerde?.name,
    valueSerde: valueSerde?.name,
  };
};

export const getPartitionOptions = (partitions: Partition[]) =>
  partitions.map(({ partition }) => ({
    label: `Partition #${partition}`,
    value: partition,
  }));

export const getSerdeOptions = (items: SerdeDescription[]) => {
  const options = items.map(({ name }) => {
    if (!name) return undefined;
    return { label: name, value: name };
  });

  return compact(options);
};

const getAjvVersionForSchemaRef = (schemaRef: string) => {
  switch (schemaRef) {
    case 'https://json-schema.org/draft/2019-09/schema':
      return new Ajv2019();
    case 'https://json-schema.org/draft/2020-12/schema':
      return new Ajv2020();
    case 'http://json-schema.org/draft-06/schema#':
      return new Ajv().addMetaSchema(draft6MetaSchema);
    case 'http://json-schema.org/draft-04/schema#':
      return new AjvDraft4();
    default:
      return new Ajv();
  }
};

export const validateBySchema = (
  value: string,
  schema: string | undefined,
  type: 'key' | 'content'
) => {
  let errors: string[] = [];

  if (!value || !schema) {
    return errors;
  }

  let parsedSchema;
  let parsedValue;

  try {
    parsedSchema = JSON.parse(schema);
  } catch (e) {
    return [`Error in parsing the "${type}" field schema`];
  }
  if (parsedSchema.type === 'string') {
    return [];
  }
  try {
    parsedValue = JSON.parse(value);
  } catch (e) {
    return [`Error in parsing the "${type}" field value`];
  }
  try {
    const schemaRef = parsedSchema.$schema;
    const ajv = getAjvVersionForSchemaRef(schemaRef);
    addFormats(ajv);
    const validate = ajv.compile(parsedSchema);
    validate(parsedValue);
    if (validate.errors) {
      errors = validate.errors.map(
        ({ schemaPath, message }) =>
          `${schemaPath.replace('#', upperFirst(type))} - ${message}`
      );
    }
  } catch (e) {
    const err = e as DefinedError;
    return [`${upperFirst(type)} ${err.message}`];
  }

  return errors;
};
