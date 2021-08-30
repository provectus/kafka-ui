import React from 'react';
import SendMessage, {
  Props,
} from 'components/Topics/Topic/SendMessage/SendMessage';
import { MessageSchemaSourceEnum } from 'generated-sources';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockConvertToYup = jest
  .fn()
  .mockReturnValue(() => ({ validate: () => true }));

jest.mock('yup-faker', () => ({
  getFakeData: () => ({
    f1: -93251214,
    schema: 'enim sit in fugiat dolor',
    f2: 'deserunt culpa sunt',
  }),
}));

const setupWrapper = (props?: Partial<Props>) => (
  <SendMessage
    clusterName="testCluster"
    topicName="testTopic"
    fetchTopicMessageSchema={jest.fn()}
    sendTopicMessage={jest.fn()}
    messageSchema={{
      key: {
        name: 'key',
        source: MessageSchemaSourceEnum.SCHEMA_REGISTRY,
        schema: `{
          "$schema": "http://json-schema.org/draft-07/schema#",
          "$id": "http://example.com/myURI.schema.json",
          "title": "TestRecord",
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "f1": {
              "type": "integer"
            },
            "f2": {
              "type": "string"
            },
            "schema": {
              "type": "string"
            }
          }
        }
        `,
      },
      value: {
        name: 'value',
        source: MessageSchemaSourceEnum.SCHEMA_REGISTRY,
        schema: `{
          "$schema": "http://json-schema.org/draft-07/schema#",
          "$id": "http://example.com/myURI1.schema.json",
          "title": "TestRecord",
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "f1": {
              "type": "integer"
            },
            "f2": {
              "type": "string"
            },
            "schema": {
              "type": "string"
            }
          }
        }
        `,
      },
    }}
    schemaIsFetched={false}
    messageIsSending={false}
    partitions={[
      {
        partition: 0,
        leader: 2,
        replicas: [
          {
            broker: 2,
            leader: false,
            inSync: true,
          },
        ],
        offsetMax: 0,
        offsetMin: 0,
      },
      {
        partition: 1,
        leader: 1,
        replicas: [
          {
            broker: 1,
            leader: false,
            inSync: true,
          },
        ],
        offsetMax: 0,
        offsetMin: 0,
      },
    ]}
    {...props}
  />
);

describe('SendMessage', () => {
  it('calls fetchTopicMessageSchema on first render', () => {
    const fetchTopicMessageSchemaMock = jest.fn();
    render(
      setupWrapper({ fetchTopicMessageSchema: fetchTopicMessageSchemaMock })
    );
    expect(fetchTopicMessageSchemaMock).toHaveBeenCalledTimes(1);
  });

  describe('when schema is fetched', () => {
    it('calls sendTopicMessage on submit', async () => {
      jest.mock('json-schema-yup-transformer', () => mockConvertToYup);
      jest.mock('../validateMessage', () => jest.fn().mockReturnValue(true));
      const mockSendTopicMessage = jest.fn();
      render(
        setupWrapper({
          schemaIsFetched: true,
          sendTopicMessage: mockSendTopicMessage,
        })
      );
      const select = await screen.findByLabelText('Partition');
      fireEvent.change(select, {
        target: { value: 2 },
      });
      await waitFor(async () => {
        fireEvent.click(await screen.findByText('Send'));
        expect(mockSendTopicMessage).toHaveBeenCalledTimes(1);
      });
    });
  });
});
