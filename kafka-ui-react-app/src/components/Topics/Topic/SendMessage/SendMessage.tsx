import { Button } from 'components/common/Button/Button';
import Editor from 'components/common/Editor/Editor';
import Heading from 'components/common/heading/Heading.styled';
import Select, { SelectOption } from 'components/common/Select/Select';
import { SerdeUsage, TopicSerdeSuggestion } from 'generated-sources';
import jsf from 'json-schema-faker';
import { messagesApiClient } from 'lib/api';
import { showAlert } from 'lib/errorHandling';
import {
  useSendMessage,
  useTopicDetails,
  useTopicMessageSchema,
} from 'lib/hooks/api/topics';
import useAppParams from 'lib/hooks/useAppParams';
import {
  clusterTopicMessagesRelativePath,
  RouteParamsClusterTopic,
} from 'lib/paths';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  fetchTopicSerdes,
  setTopicSerdes,
} from 'redux/reducers/topicMessages/topicMessagesSlice';

import * as S from './SendMessage.styled';
import validateMessage from './validateMessage';

type FieldValues = Partial<{
  key: string;
  content: string;
  headers: string;
  partition: number | string;
  keySerde: string;
  valueSerde: string;
}>;

const SendMessage: React.FC = () => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();
  const navigate = useNavigate();
  const { data: topic } = useTopicDetails({ clusterName, topicName });
  const { data: messageSchema } = useTopicMessageSchema({
    clusterName,
    topicName,
  });
  const sendMessage = useSendMessage({ clusterName, topicName });

  jsf.option('fillProperties', false);
  jsf.option('alwaysFakeOptionals', true);

  const [serdeOptions, setSerdeOptions] =
    React.useState<TopicSerdeSuggestion>();
  const [selectedSerdeKey, setSelectedSerdeKey] = React.useState('');
  const [selectedSerdeValue, setSelectedSerdeValue] = React.useState('');
  const partitions = topic?.partitions || [];

  const selectPartitionOptions: Array<SelectOption> = partitions.map((p) => {
    const value = String(p.partition);
    return { value, label: value };
  });

  const keyDefaultValue = React.useMemo(() => {
    if (!messageSchema) {
      return undefined;
    }
    return JSON.stringify(
      jsf.generate(JSON.parse(messageSchema.key.schema)),
      null,
      '\t'
    );
  }, [messageSchema]);

  const contentDefaultValue = React.useMemo(() => {
    if (!messageSchema) {
      return undefined;
    }
    return JSON.stringify(
      jsf.generate(JSON.parse(messageSchema.value.schema)),
      null,
      '\t'
    );
  }, [messageSchema]);

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty },
    control,
    reset,
  } = useForm<FieldValues>({
    mode: 'onChange',
    defaultValues: {
      key: keyDefaultValue,
      content: contentDefaultValue,
      headers: undefined,
      partition: undefined,
    },
  });

  useEffect(() => {
    reset({
      key: keyDefaultValue,
      content: contentDefaultValue,
    });
  }, [keyDefaultValue, contentDefaultValue, reset]);

  React.useEffect(() => {
    const init = async () => {
      const serdes = await messagesApiClient.getSerdes({
        topicName,
        clusterName,
        use: SerdeUsage.SERIALIZE,
      });

      if (serdes.key && serdes.value) {
        setSerdeOptions(serdes);
      }
    };

    init();
  }, [fetchTopicSerdes, setTopicSerdes, topicName, clusterName]);

  React.useEffect(() => {
    if (serdeOptions != null && serdeOptions.key && serdeOptions.value) {
      setSerdeOptions(serdeOptions);

      const preferredKeySerde = serdeOptions.key.find((k) => k.preferred);
      const preferredValueSerde = serdeOptions.value.find((v) => v.preferred);

      if (
        typeof preferredKeySerde !== 'undefined' &&
        typeof preferredValueSerde !== 'undefined'
      ) {
        setSelectedSerdeKey(preferredKeySerde.name as string);
        setSelectedSerdeValue(preferredValueSerde.name as string);
      }
    }
  }, [serdeOptions]);

  const onSubmit = async (data: {
    key: string;
    content: string;
    headers: string;
    partition: number;
  }) => {
    if (messageSchema) {
      const { partition, key, content } = data;
      const errors = validateMessage(key, content, messageSchema);
      if (data.headers) {
        try {
          JSON.parse(data.headers);
        } catch (error) {
          errors.push('Wrong header format');
        }
      }
      if (errors.length > 0) {
        showAlert('error', {
          id: `${clusterName}-${topicName}-createTopicMessageError`,
          title: 'Validation Error',
          message: (
            <ul>
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ),
        });
        return;
      }
      const headers = data.headers ? JSON.parse(data.headers) : undefined;
      await sendMessage.mutateAsync({
        key: !key ? null : key,
        content: !content ? null : content,
        headers,
        partition: !partition ? 0 : partition,
        keySerde: selectedSerdeKey,
        valueSerde: selectedSerdeValue,
      });
      navigate(`../${clusterTopicMessagesRelativePath}`);
    }
  };

  return (
    <S.Wrapper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <S.Columns>
          <S.Column>
            <Heading level={3}>Partition</Heading>
            <Controller
              control={control}
              name="partition"
              defaultValue={selectPartitionOptions[0].value}
              render={({ field: { name, onChange } }) => (
                <Select
                  id="selectPartitionOptions"
                  aria-labelledby="selectPartitionOptions"
                  name={name}
                  onChange={onChange}
                  minWidth="100px"
                  options={selectPartitionOptions}
                  value={selectPartitionOptions[0].value}
                />
              )}
            />
          </S.Column>
        </S.Columns>

        <S.Columns>
          <S.Column>
            <Heading level={3}>Key Serde</Heading>
            <Controller
              control={control}
              name="keySerde"
              render={({ field: { name, onChange } }) => (
                <Select
                  id="keySerdeOptions"
                  aria-labelledby="keySerdeOptions"
                  name={name}
                  onChange={onChange}
                  minWidth="100%"
                  options={
                    Array.isArray(serdeOptions?.key)
                      ? serdeOptions?.key.map((keyItem) => ({
                          label: keyItem.name || '',
                          value: keyItem.name || '',
                        }))
                      : []
                  }
                  value={selectedSerdeKey}
                />
              )}
            />
          </S.Column>

          <S.Column>
            <Heading level={3}>Value Serde</Heading>
            <Controller
              control={control}
              name="valueSerde"
              render={({ field: { name, onChange } }) => (
                <Select
                  id="valueSerdeOptions"
                  aria-labelledby="valueSerdeOptions"
                  name={name}
                  onChange={onChange}
                  minWidth="100%"
                  options={
                    Array.isArray(serdeOptions?.value)
                      ? serdeOptions?.value.map((keyItem) => ({
                          label: keyItem.name || '',
                          value: keyItem.name || '',
                        }))
                      : []
                  }
                  value={selectedSerdeValue}
                />
              )}
            />
          </S.Column>
        </S.Columns>

        <S.Columns>
          <S.Column>
            <Heading level={3}>Key</Heading>
            <Controller
              control={control}
              name="key"
              render={({ field: { name, onChange, value } }) => (
                <Editor
                  readOnly={isSubmitting}
                  name={name}
                  onChange={onChange}
                  value={value}
                />
              )}
            />
          </S.Column>
          <S.Column>
            <Heading level={3}>Content</Heading>
            <Controller
              control={control}
              name="content"
              render={({ field: { name, onChange, value } }) => (
                <Editor
                  readOnly={isSubmitting}
                  name={name}
                  onChange={onChange}
                  value={value}
                />
              )}
            />
          </S.Column>
        </S.Columns>
        <S.Columns>
          <S.Column>
            <Heading level={3}>Headers</Heading>
            <Controller
              control={control}
              name="headers"
              render={({ field: { name, onChange } }) => (
                <Editor
                  readOnly={isSubmitting}
                  defaultValue="{}"
                  name={name}
                  onChange={onChange}
                  height="200px"
                />
              )}
            />
          </S.Column>
        </S.Columns>
        <Button
          buttonSize="M"
          buttonType="primary"
          type="submit"
          disabled={!isDirty || isSubmitting}
        >
          Send
        </Button>
      </form>
    </S.Wrapper>
  );
};

export default SendMessage;
