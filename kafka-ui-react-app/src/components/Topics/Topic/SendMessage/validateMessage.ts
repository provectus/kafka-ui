import { TopicMessageSchema } from 'generated-sources';
import Ajv from 'ajv/dist/2020';

const validateMessage = async (
  key: string,
  content: string,
  messageSchema: TopicMessageSchema | undefined,
  setSchemaErrors: React.Dispatch<React.SetStateAction<string[]>>
): Promise<boolean> => {
  setSchemaErrors([]);
  const keyAjv = new Ajv();
  const contentAjv = new Ajv();
  try {
    if (messageSchema) {
      let keyIsValid = false;
      let contentIsValid = false;

      try {
        const keySchema = JSON.parse(messageSchema.key.schema);
        const validateKey = keyAjv.compile(keySchema);
        if (keySchema.type === 'string') {
          keyIsValid = true;
        } else {
          keyIsValid = validateKey(JSON.parse(key));
        }
        if (!keyIsValid) {
          const errorString: string[] = [];
          if (validateKey.errors) {
            validateKey.errors.forEach((e) => {
              errorString.push(
                `${e.schemaPath.replace('#', 'Key')} ${e.message}`
              );
            });
            setSchemaErrors((e) => [...e, ...errorString]);
          }
        }
      } catch (err) {
        setSchemaErrors((e) => [...e, `Key ${err.message}`]);
      }
      try {
        const contentSchema = JSON.parse(messageSchema.value.schema);
        const validateContent = contentAjv.compile(contentSchema);
        if (contentSchema.type === 'string') {
          contentIsValid = true;
        } else {
          contentIsValid = validateContent(JSON.parse(content));
        }
        if (!contentIsValid) {
          const errorString: string[] = [];
          if (validateContent.errors) {
            validateContent.errors.forEach((e) => {
              errorString.push(
                `${e.schemaPath.replace('#', 'Content')} ${e.message}`
              );
            });
            setSchemaErrors((e) => [...e, ...errorString]);
          }
        }
      } catch (err) {
        setSchemaErrors((e) => [...e, `Content ${err.message}`]);
      }

      return keyIsValid && contentIsValid;
    }
  } catch (err) {
    setSchemaErrors((e) => [...e, err.message]);
  }
  return false;
};

export default validateMessage;
