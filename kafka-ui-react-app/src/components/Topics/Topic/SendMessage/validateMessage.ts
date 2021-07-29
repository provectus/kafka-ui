import { TopicMessageSchema } from 'generated-sources';
import convertToYup from 'json-schema-yup-transformer';

const validateMessage = async (
  key: string,
  content: string,
  messageSchema: TopicMessageSchema | undefined,
  setSchemaErrorString: React.Dispatch<React.SetStateAction<string>>
): Promise<boolean> => {
  setSchemaErrorString('');
  try {
    if (messageSchema) {
      const validateKey = convertToYup(JSON.parse(messageSchema.key.schema));
      const validateContent = convertToYup(
        JSON.parse(messageSchema.value.schema)
      );
      let keyIsValid = false;
      let contentIsValid = false;

      try {
        await validateKey?.validate(JSON.parse(key));
        keyIsValid = true;
      } catch (err) {
        let errorString = '';
        if (err.errors) {
          err.errors.forEach((e: string) => {
            errorString = errorString ? `${errorString}-Key ${e}` : `Key ${e}`;
          });
        } else {
          errorString = errorString
            ? `${errorString}-Key ${err.message}`
            : `Key ${err.message}`;
        }

        setSchemaErrorString((e) => (e ? `${e}-${errorString}` : errorString));
      }
      try {
        await validateContent?.validate(JSON.parse(content));
        contentIsValid = true;
      } catch (err) {
        let errorString = '';
        if (err.errors) {
          err.errors.forEach((e: string) => {
            errorString = errorString
              ? `${errorString}-Content ${e}`
              : `Content ${e}`;
          });
        } else {
          errorString = errorString
            ? `${errorString}-Content ${err.message}`
            : `Content ${err.message}`;
        }

        setSchemaErrorString((e) => (e ? `${e}-${errorString}` : errorString));
      }

      if (keyIsValid && contentIsValid) {
        return true;
      }
    }
  } catch (err) {
    setSchemaErrorString((e) => (e ? `${e}-${err.message}` : err.message));
  }
  return false;
};

export default validateMessage;
