import * as yup from 'yup';

import { TOPIC_NAME_VALIDATION_PATTERN } from './constants';

declare module 'yup' {
  interface StringSchema<
    TType extends yup.Maybe<string> = string | undefined,
    TContext = yup.AnyObject,
    TDefault = undefined,
    TFlags extends yup.Flags = ''
  > extends yup.Schema<TType, TContext, TDefault, TFlags> {
    isJsonObject(message?: string): StringSchema<TType, TContext>;
    isEnum(message?: string): StringSchema<TType, TContext>;
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

const isJsonObject = (message?: string) => {
  return yup.string().test(
    'isJsonObject',
    // eslint-disable-next-line no-template-curly-in-string
    message || '${path} is not JSON object',
    isValidJsonObject
  );
};

export const isValidEnum = (value?: string) => {
  try {
    if (!value) return false;
    const trimmedValue = value.trim();
    if (
      trimmedValue.indexOf('enum') === 0 &&
      trimmedValue.lastIndexOf('}') === trimmedValue.length - 1
    ) {
      return true;
    }
  } catch {
    // do nothing
  }
  return false;
};

const isEnum = (message?: string) => {
  return yup.string().test(
    'isEnum',
    // eslint-disable-next-line no-template-curly-in-string
    message || '${path} is not Enum object',
    isValidEnum
  );
};

/**
 * due to yup rerunning all the object validiation during any render,
 * it makes sense to cache the async results
 * */
export function cacheTest(
  asyncValidate: (val?: string, ctx?: yup.AnyObject) => Promise<boolean>
) {
  let valid = false;
  let closureValue = '';

  return async (value?: string, ctx?: yup.AnyObject) => {
    if (value !== closureValue) {
      const response = await asyncValidate(value, ctx);
      closureValue = value || '';
      valid = response;
      return response;
    }
    return valid;
  };
}

yup.addMethod(yup.StringSchema, 'isJsonObject', isJsonObject);
yup.addMethod(yup.StringSchema, 'isEnum', isEnum);

export const topicFormValidationSchema = yup.object().shape(
  {
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
    replicationFactor: yup.lazy((value) => {
      if (value && value !== '') {
        return yup.number().when('minInSyncReplicas', {
          is: (val) => val && val !== '',
          then: () =>
            yup
              .number()
              .min(
                yup.ref('minInSyncReplicas'),
                'Replication Factor must be greater than Min In Sync Replicas'
              )
              .required(),
          otherwise: () => yup.number().min(0),
        });
      }
      return yup.string();
    }),
    minInSyncReplicas: yup.lazy((value) => {
      if (value && value !== '') {
        return yup.number().when('replicationFactor', {
          is: (val) => val && val !== '',
          then: () =>
            yup
              .number()
              .max(
                yup.ref('replicationFactor'),
                'Min In Sync Replicas must be less than or equal to Replication Factor'
              )
              .required(),
          otherwise: () => yup.number().max(0),
        });
      }
      return yup.string();
    }),
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
  },
  ['minInSyncReplicas', 'replicationFactor']
);

export default yup;
