import { TopicMessageSchema } from 'generated-sources';
import Ajv, { DefinedError } from 'ajv/dist/2020';
import upperFirst from 'lodash/upperFirst';

const validateBySchema = (
  value: string,
  schema: string | undefined,
  type: 'key' | 'content'
) => {
  let errors: string[] = [];

  if (!value || !schema) {
    return errors;
  }

  let parcedSchema;
  let parsedValue;

  try {
    parcedSchema = JSON.parse(schema);
  } catch (e) {
    return [`Error in parsing the "${type}" field schema`];
  }
  if (parcedSchema.type === 'string') {
    return [];
  }
  try {
    parsedValue = JSON.parse(value);
  } catch (e) {
    return [`Error in parsing the "${type}" field value`];
  }
  try {
    const validate = new Ajv().compile(parcedSchema);
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

const validateMessage = (
  key: string,
  content: string,
  messageSchema: TopicMessageSchema | undefined
): string[] => [
  ...validateBySchema(key, messageSchema?.key?.schema, 'key'),
  ...validateBySchema(content, messageSchema?.value?.schema, 'content'),
];

export default validateMessage;
