import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  clusterTopicMessagesRelativePath,
  RouteParamsClusterTopic,
} from 'lib/paths';
import jsf from 'json-schema-faker';
import {
  fetchTopicMessageSchema,
  fetchTopicDetails,
} from 'redux/reducers/topics/topicsSlice';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import { alertAdded } from 'redux/reducers/alerts/alertsSlice';
import now from 'lodash/now';
import { Button } from 'components/common/Button/Button';
import Editor from 'components/common/Editor/Editor';
import {
  getMessageSchemaByTopicName,
  getPartitionsByTopicName,
  getTopicMessageSchemaFetched,
} from 'redux/reducers/topics/selectors';
import Select, { SelectOption } from 'components/common/Select/Select';
import useAppParams from 'lib/hooks/useAppParams';
import Heading from 'components/common/heading/Heading.styled';
import { messagesApiClient } from 'lib/api';
import { getResponse } from 'lib/errorHandling';
import {
  fetchTopicSerdes,
  setTopicSerdes,
} from 'redux/reducers/topicMessages/topicMessagesSlice';
import { SerdeUsage, TopicSerdeSuggestion } from 'generated-sources';
import PageLoader from 'components/common/PageLoader/PageLoader';

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
  const dispatch = useAppDispatch();
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();
  const navigate = useNavigate();

  jsf.option('fillProperties', false);
  jsf.option('alwaysFakeOptionals', true);

  const [serdeOptions, setSerdeOptions] =
    React.useState<TopicSerdeSuggestion>();
  const [selectedSerdeKey, setSelectedSerdeKey] = React.useState('');
  const [selectedSerdeValue, setSelectedSerdeValue] = React.useState('');

  React.useEffect(() => {
    dispatch(fetchTopicMessageSchema({ clusterName, topicName }));
  }, [clusterName, dispatch, topicName]);

  const messageSchema = useAppSelector((state) =>
    getMessageSchemaByTopicName(state, topicName)
  );
  const partitions = useAppSelector((state) =>
    getPartitionsByTopicName(state, topicName)
  );

  const schemaIsFetched = useAppSelector(getTopicMessageSchemaFetched);
  const selectPartitionOptions: Array<SelectOption> = partitions.map((p) => {
    const value = String(p.partition);
    return { value, label: value };
  });

  const keyDefaultValue = React.useMemo(() => {
    if (!schemaIsFetched || !messageSchema) {
      return undefined;
    }
    return JSON.stringify(
      jsf.generate(JSON.parse(messageSchema.key.schema)),
      null,
      '\t'
    );
  }, [messageSchema, schemaIsFetched]);

  const contentDefaultValue = React.useMemo(() => {
    if (!schemaIsFetched || !messageSchema) {
      return undefined;
    }
    return JSON.stringify(
      jsf.generate(JSON.parse(messageSchema.value.schema)),
      null,
      '\t'
    );
  }, [messageSchema, schemaIsFetched]);

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
        const errorsHtml = errors.map((e) => `<li>${e}</li>`).join('');
        dispatch(
          alertAdded({
            id: `${clusterName}-${topicName}-createTopicMessageError`,
            type: 'error',
            title: 'Validation Error',
            message: `<ul>${errorsHtml}</ul>`,
            createdAt: now(),
          })
        );
        return;
      }
      const headers = data.headers ? JSON.parse(data.headers) : undefined;
      try {
        await messagesApiClient.sendTopicMessages({
          clusterName,
          topicName,
          createTopicMessage: {
            key: !key ? null : key,
            content: !content ? null : content,
            headers,
            partition: !partition ? 0 : partition,
            keySerde: selectedSerdeKey,
            valueSerde: selectedSerdeValue,
          },
        });
        dispatch(fetchTopicDetails({ clusterName, topicName }));
      } catch (e) {
        const err = await getResponse(e as Response);
        dispatch(
          alertAdded({
            id: `${clusterName}-${topicName}-sendTopicMessagesError`,
            type: 'error',
            title: `Error in sending a message to ${topicName}`,
            message: err?.message || '',
            createdAt: now(),
          })
        );
      }
      navigate(`../${clusterTopicMessagesRelativePath}`);
    }
  };

  if (!schemaIsFetched) {
    return <PageLoader />;
  }

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
                  minWidth="100%"
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
