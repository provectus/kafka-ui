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

yup.addMethod(yup.string, 'isJsonObject', isJsonObject);

export default yup;

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
  replicationFactor: yup
    .number()
    .min(1)
    .max(2147483647)
    .required()
    .typeError('Replication factor is required and must be a number'),
  minInSyncReplicas: yup
    .number()
    .min(1)
    .max(2147483647)
    .required()
    .typeError('Min in sync replicas is required and must be a number'),
  cleanupPolicy: yup.string().required(),
  retentionMs: yup
    .number()
    .min(-1, 'Must be greater than or equal to -1')
    .typeError('Time to retain data is required and must be a number'),
  retentionBytes: yup.number(),
  maxMessageBytes: yup
    .number()
    .min(1)
    .required()
    .typeError('Maximum message size is required and must be a number'),
  customParams: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Custom parameter is required'),
      value: yup.string().required('Value is required'),
    })
  ),
});
