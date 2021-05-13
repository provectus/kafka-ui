import * as yup from 'yup';
import { AnyObject, Maybe } from 'yup/lib/types';

declare module 'yup' {
  interface StringSchema<
    TType extends Maybe<string> = string | undefined,
    TContext extends AnyObject = AnyObject,
    TOut extends TType = TType
  > extends yup.BaseSchema<TType, TContext, TOut> {
    isJsonObject(): StringSchema<TType, TContext>;
  }
}

export const isValidJsonObject = (value?: string) => {
  try {
    if (!value) return false;
    if (
      value.indexOf('{') === 0 &&
      value.lastIndexOf('}') === value.length - 1
    ) {
      JSON.parse(value);
      return true;
    }
  } catch {
    // do nothing
  }
  return false;
};

const isJsonObject = () => {
  return yup.string().test(
    'isJsonObject',
    // eslint-disable-next-line no-template-curly-in-string
    '${path} is not JSON object',
    isValidJsonObject
  );
};

yup.addMethod(yup.string, 'isJsonObject', isJsonObject);

export default yup;
