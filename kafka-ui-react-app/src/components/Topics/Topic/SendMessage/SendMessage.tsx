import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  clusterTopicMessagesRelativePath,
  RouteParamsClusterTopic,
} from 'lib/paths';
import jsf from 'json-schema-faker';
import { Button } from 'components/common/Button/Button';
import Editor from 'components/common/Editor/Editor';
import Select, { SelectOption } from 'components/common/Select/Select';
import useAppParams from 'lib/hooks/useAppParams';
import Heading from 'components/common/heading/Heading.styled';
import { showAlert } from 'lib/errorHandling';
import {
  useSendMessage,
  useTopicDetails,
  useTopicMessageSchema,
} from 'lib/hooks/api/topics';

import validateMessage from './validateMessage';
import * as S from './SendMessage.styled';

type FieldValues = Partial<{
  key: string;
  content: string;
  headers: string;
  partition: number | string;
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
        showAlert('error', {
          id: `${clusterName}-${topicName}-createTopicMessageError`,
          title: 'Validation Error',
          message: `<ul>${errorsHtml}</ul>`,
        });
        return;
      }
      const headers = data.headers ? JSON.parse(data.headers) : undefined;
      await sendMessage.mutateAsync({
        key: !key ? null : key,
        content: !content ? null : content,
        headers,
        partition: !partition ? 0 : partition,
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
