import Editor from 'components/common/Editor/Editor';
import PageLoader from 'components/common/PageLoader/PageLoader';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useHistory, useParams } from 'react-router';
import { clusterTopicMessagesPath } from 'lib/paths';
import jsf from 'json-schema-faker';
import { fetchTopicMessageSchema, messagesApiClient } from 'redux/actions';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import { alertAdded } from 'redux/reducers/alerts/alertsSlice';
import { now } from 'lodash';
import { Button } from 'components/common/Button/Button';
import { ClusterName, TopicName } from 'redux/interfaces';
import {
  getMessageSchemaByTopicName,
  getPartitionsByTopicName,
  getTopicMessageSchemaFetched,
} from 'redux/reducers/topics/selectors';

import validateMessage from './validateMessage';
import * as S from './SendMessage.styled';

interface RouterParams {
  clusterName: ClusterName;
  topicName: TopicName;
}

const SendMessage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clusterName, topicName } = useParams<RouterParams>();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    control,
  } = useForm({ mode: 'onChange' });
  const history = useHistory();

  jsf.option('fillProperties', false);
  jsf.option('alwaysFakeOptionals', true);

  React.useEffect(() => {
    dispatch(fetchTopicMessageSchema(clusterName, topicName));
  }, []);

  const messageSchema = useAppSelector((state) =>
    getMessageSchemaByTopicName(state, topicName)
  );
  const partitions = useAppSelector((state) =>
    getPartitionsByTopicName(state, topicName)
  );
  const schemaIsFetched = useAppSelector(getTopicMessageSchemaFetched);

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

  const onSubmit = async (data: {
    key: string;
    content: string;
    headers: string;
    partition: number;
  }) => {
    if (messageSchema) {
      const { partition, key, content } = data;
      const headers = data.headers ? JSON.parse(data.headers) : undefined;
      const errors = validateMessage(key, content, messageSchema);
      if (errors.length > 0) {
        dispatch(
          alertAdded({
            id: `${clusterName}-${topicName}-createTopicMessageError`,
            type: 'error',
            title: 'Validation Error',
            message: (
              <ul>
                {errors.map((e) => (
                  <li>{e}</li>
                ))}
              </ul>
            ),
            createdAt: now(),
          })
        );
        return;
      }

      try {
        await messagesApiClient.sendTopicMessages({
          clusterName,
          topicName,
          createTopicMessage: {
            key: !key ? null : key,
            content: !content ? null : content,
            headers,
            partition,
          },
        });
      } catch (e) {
        dispatch(
          alertAdded({
            id: `${clusterName}-${topicName}-sendTopicMessagesError`,
            type: 'error',
            title: `Error in sending a message to ${topicName}`,
            message: e?.message,
            createdAt: now(),
          })
        );
      }
      history.push(clusterTopicMessagesPath(clusterName, topicName));
    }
  };

  if (!schemaIsFetched) {
    return <PageLoader />;
  }
  return (
    <S.Wrapper>
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
                disabled={isSubmitting}
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
                <Editor
                  readOnly={isSubmitting}
                  defaultValue={keyDefaultValue}
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
                <Editor
                  readOnly={isSubmitting}
                  defaultValue={contentDefaultValue}
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
                <Editor
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
