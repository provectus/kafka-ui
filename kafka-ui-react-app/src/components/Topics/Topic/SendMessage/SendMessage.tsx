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

import validateMessage from './validateMessage';

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
  const [schemaIsReady, setSchemaIsReady] = React.useState(false);
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
        setSchemaIsReady(true);
      }

      const validateContent = convertToYup(
        JSON.parse(messageSchema.value.schema)
      );
      if (validateContent) {
        setContentExampleValue(
          JSON.stringify(getFakeData(validateContent), null, '\t')
        );
        setSchemaIsReady(true);
      }

      if (!validateKey && !validateContent) {
        setSchemaIsReady(true);
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
    if (messageSchema) {
      const key = data.key || keyExampleValue;
      const content = data.content || contentExampleValue;
      const { partition } = data;
      const headers = data.headers ? JSON.parse(data.headers) : undefined;
      const messageIsValid = await validateMessage(
        key,
        content,
        messageSchema,
        setSchemaErrorString
      );

      if (messageIsValid) {
        sendTopicMessage(clusterName, topicName, {
          key,
          content,
          headers,
          partition,
        });
      }
    }
  };

  if (!schemaIsReady) {
    return <PageLoader />;
  }
  return (
    <div className="box">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="columns">
          <div className="column is-one-third">
            <label className="label" htmlFor="select">
              Partition
            </label>
            <div className="select is-block">
              <select
                id="select"
                defaultValue={partitions[0].partition}
                disabled={isSubmitting || messageIsSending}
                {...register('partition')}
              >
                {partitions.map((partition) => (
                  <option key={partition.partition} value={partition.partition}>
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
            {schemaErrorString.split('-').map((err) => (
              <p className="help is-danger" key={err}>
                {err}
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
  );
};

export default SendMessage;
