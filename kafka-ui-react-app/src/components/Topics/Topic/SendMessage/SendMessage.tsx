import JSONEditor from 'components/common/JSONEditor/JSONEditor';
import PageLoader from 'components/common/PageLoader/PageLoader';
import {
  CreateTopicMessage,
  Partition,
  TopicMessageSchema,
} from 'generated-sources';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import convertToYup from 'json-schema-yup-transformer';
import { getFakeData } from 'yup-faker';
import { useHistory } from 'react-router';
import { clusterTopicMessagesPath } from 'lib/paths';

export interface Props {
  clusterName: string;
  topicName: string;
  fetchTopicMessageSchema: (clusterName: string, topicName: string) => void;
  sendTopicMessage: (
    clusterName: string,
    topicName: string,
    payload: CreateTopicMessage
  ) => void;
  messageSchema: TopicMessageSchema | undefined;
  schemaIsFetched: boolean;
  messageIsSent: boolean;
  messageIsSending: boolean;
  partitions: Partition[];
}

const SendMessage: React.FC<Props> = ({
  clusterName,
  topicName,
  fetchTopicMessageSchema,
  sendTopicMessage,
  messageSchema,
  schemaIsFetched,
  messageIsSent,
  messageIsSending,
  partitions,
}) => {
  const [keyExampleValue, setKeyExampleValue] = React.useState('');
  const [contentExampleValue, setContentExampleValue] = React.useState('');
  const [schemaErrorString, setSchemaErrorString] = React.useState('');
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    control,
  } = useForm({ mode: 'onChange' });
  const history = useHistory();

  React.useEffect(() => {
    fetchTopicMessageSchema(clusterName, topicName);
  }, []);
  React.useEffect(() => {
    if (schemaIsFetched && messageSchema) {
      const validateKey = convertToYup(JSON.parse(messageSchema.key.schema));
      if (validateKey) {
        setKeyExampleValue(
          JSON.stringify(getFakeData(validateKey), null, '\t')
        );
      }

      const validateContent = convertToYup(
        JSON.parse(messageSchema.value.schema)
      );
      if (validateContent) {
        setContentExampleValue(
          JSON.stringify(getFakeData(validateContent), null, '\t')
        );
      }
    }
  }, [schemaIsFetched]);
  React.useEffect(() => {
    if (messageIsSent) {
      history.push(clusterTopicMessagesPath(clusterName, topicName));
    }
  }, [messageIsSent]);

  const onSubmit = async (data: {
    key: string;
    content: string;
    headers: string;
    partition: number;
  }) => {
    setSchemaErrorString('');
    try {
      if (messageSchema) {
        const key = data.key || keyExampleValue;
        const content = data.content || contentExampleValue;
        const { partition } = data;
        const headers = data.headers ? JSON.parse(data.headers) : undefined;

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
              errorString = errorString
                ? `${errorString}-Key ${e}`
                : `Key ${e}`;
            });
          } else {
            errorString = errorString
              ? `${errorString}-Key ${err.message}`
              : `Key ${err.message}`;
          }

          setSchemaErrorString((e) =>
            e ? `${e}-${errorString}` : errorString
          );
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

          setSchemaErrorString((e) =>
            e ? `${e}-${errorString}` : errorString
          );
        }

        if (keyIsValid && contentIsValid) {
          sendTopicMessage(clusterName, topicName, {
            key,
            content,
            headers,
            partition,
          });
        }
      }
    } catch (err) {
      setSchemaErrorString((e) => (e ? `${e}-${err.message}` : err.message));
    }
  };
  return (
    <>
      {!keyExampleValue && !contentExampleValue ? (
        <PageLoader />
      ) : (
        <div className="box">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="columns">
              <div className="column is-one-third">
                <label className="label">Partition</label>
                <div className="select is-block">
                  <select
                    defaultValue={partitions[0].partition}
                    disabled={isSubmitting || messageIsSending}
                    {...register('partition')}
                  >
                    {partitions.map((partition) => (
                      <option
                        key={partition.partition}
                        value={partition.partition}
                      >
                        {partition.partition}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="columns">
              <div className="column is-one-half">
                <label className="label">Key</label>
                <Controller
                  control={control}
                  name="key"
                  render={({ field: { name, onChange } }) => (
                    <JSONEditor
                      readOnly={isSubmitting || messageIsSending}
                      defaultValue={keyExampleValue}
                      name={name}
                      onChange={onChange}
                    />
                  )}
                />
              </div>
              <div className="column is-one-half">
                <label className="label">Content</label>
                <Controller
                  control={control}
                  name="content"
                  render={({ field: { name, onChange } }) => (
                    <JSONEditor
                      readOnly={isSubmitting || messageIsSending}
                      defaultValue={contentExampleValue}
                      name={name}
                      onChange={onChange}
                    />
                  )}
                />
              </div>
            </div>
            <div className="columns">
              <div className="column">
                <label className="label">Headers</label>
                <Controller
                  control={control}
                  name="headers"
                  render={({ field: { name, onChange } }) => (
                    <JSONEditor
                      readOnly={isSubmitting || messageIsSending}
                      defaultValue="{}"
                      name={name}
                      onChange={onChange}
                      height="200px"
                    />
                  )}
                />
              </div>
            </div>
            {schemaErrorString && (
              <div className="mb-4">
                {schemaErrorString.split('-').map((e) => (
                  <p className="help is-danger" key={e}>
                    {e}
                  </p>
                ))}
              </div>
            )}
            <button
              type="submit"
              className="button is-primary"
              disabled={!isDirty || isSubmitting || messageIsSending}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default SendMessage;
