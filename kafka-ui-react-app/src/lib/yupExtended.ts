import * as yup from 'yup';
import { AnyObject, Maybe } from 'yup/lib/types';

import { TOPIC_NAME_VALIDATION_PATTERN } from './constants';

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

    const trimmedValue = value.trim();
    if (
      trimmedValue.indexOf('{') === 0 &&
      trimmedValue.lastIndexOf('}') === trimmedValue.length - 1
    ) {
      JSON.parse(trimmedValue);
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

/**
 * due to yup rerunning all the object validiation during any render, it makes sense to cache the async results
 * */
export function cacheTest(
  asyncValidate: (val?: string, ctx?: AnyObject) => Promise<boolean>
) {
  let valid = false;
  let closureValue = '';

  return async (value?: string, ctx?: AnyObject) => {
    if (value !== closureValue) {
      const response = await asyncValidate(value, ctx);
      closureValue = value || '';
      valid = response;
      return response;
    }
    return valid;
  };
}

yup.addMethod(yup.string, 'isJsonObject', isJsonObject);

export const topicFormValidationSchema = yup.object().shape({
  name: yup
    .string()
    .max(249)
    .required()
    .matches(
      TOPIC_NAME_VALIDATION_PATTERN,
      'Only alphanumeric, _, -, and . allowed'
    ),
  partitions: yup
    .number()
    .min(1)
    .max(2147483647)
    .required()
    .typeError('Number of partitions is required and must be a number'),
  replicationFactor: yup.string(),
  minInSyncReplicas: yup.string(),
  cleanupPolicy: yup.string().required(),
  retentionMs: yup.string(),
  retentionBytes: yup.number(),
  maxMessageBytes: yup.string(),
  customParams: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Custom parameter is required'),
      value: yup.string().required('Value is required'),
    })
  ),
});

export default yup;
