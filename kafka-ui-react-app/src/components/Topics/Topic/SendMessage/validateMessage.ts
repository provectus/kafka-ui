import { TopicMessageSchema } from 'generated-sources';
import Ajv from 'ajv/dist/2020';

const validateMessage = async (
  key: string,
  content: string,
  messageSchema: TopicMessageSchema | undefined,
  setSchemaErrors: React.Dispatch<React.SetStateAction<string[]>>
): Promise<boolean> => {
  setSchemaErrors([]);
  const ajv = new Ajv();
  try {
    if (messageSchema) {
      let keyIsValid = false;
      let contentIsValid = false;

      try {
        const validateKey = ajv.compile(JSON.parse(messageSchema.key.schema));
        keyIsValid = validateKey(JSON.parse(key));
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
        const validateContent = ajv.compile(
          JSON.parse(messageSchema.value.schema)
        );
        contentIsValid = validateContent(JSON.parse(content));
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

      if (keyIsValid && contentIsValid) {
        return true;
      }
    }
  } catch (err) {
    setSchemaErrors((e) => (e ? `${e}-${err.message}` : err.message));
  }
  return false;
};

export default validateMessage;
