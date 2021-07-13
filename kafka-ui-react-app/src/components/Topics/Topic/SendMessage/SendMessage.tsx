import JSONEditor from 'components/common/JSONEditor/JSONEditor';
import PageLoader from 'components/common/PageLoader/PageLoader';
import {
  CreateTopicMessage,
  Partition,
  TopicMessageSchema,
} from 'generated-sources';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import Ajv from 'ajv';

interface Props {
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
  partitions: Partition[];
}

const SendMessage: React.FC<Props> = ({
  clusterName,
  topicName,
  fetchTopicMessageSchema,
  sendTopicMessage,
  messageSchema,
  schemaIsFetched,
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
  const ajv = new Ajv();

  React.useEffect(() => {
    fetchTopicMessageSchema(clusterName, topicName);
  }, []);
  React.useEffect(() => {
    if (schemaIsFetched && messageSchema) {
      setKeyExampleValue(`{
  "f1": -13831056,
  "schema": "consequat",
  "f2": "ullamco culpa mollit irure"
}`);
      setContentExampleValue(`{
  "f1": -13831056,
  "schema": "consequat",
  "f2": "ullamco culpa mollit irure"
}`);
    }
  }, [schemaIsFetched]);

  const onSubmit = (data: {
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
        const headers = JSON.parse(data.headers);

        const validateKey = ajv.compile(JSON.parse(messageSchema.key.schema));
        const validateContent = ajv.compile(
          JSON.parse(messageSchema.value.schema)
        );
        const keyIsValid = validateKey(JSON.parse(key));
        const contentIsValid = validateContent(JSON.parse(content));
        if (validateKey.errors) {
          let errorString = '';
          validateKey.errors.forEach((e) => {
            errorString = `${errorString}-${e.schemaPath.replace('#', 'Key')} ${
              e.message
            }`;
          });
          setSchemaErrorString((e) => `${e}-${errorString}`);
        }
        if (validateContent.errors) {
          let errorString = '';
          validateContent.errors.forEach((e) => {
            errorString = `${errorString}-${e.schemaPath.replace(
              '#',
              'Content'
            )} ${e.message}`;
          });
          setSchemaErrorString((e) => `${e}-${errorString}`);
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
    } catch (e) {
      // Somehow need to display JSON.parse errors
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
                    {...register('partition')}
                  >
                    {partitions.map((partition) => (
                      <option key={partition.partition}>
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
                      readOnly={isSubmitting}
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
                      readOnly={isSubmitting}
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
                      readOnly={isSubmitting}
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
                  <p className="help is-danger">{e}</p>
                ))}
              </div>
            )}
            <button
              type="submit"
              className="button is-primary"
              disabled={!isDirty || isSubmitting}
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
