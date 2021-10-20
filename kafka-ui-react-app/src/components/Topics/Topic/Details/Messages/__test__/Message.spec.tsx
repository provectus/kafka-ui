import { TopicMessage, TopicMessageTimestampTypeEnum } from 'generated-sources';
import React from 'react';
import Message from 'components/Topics/Topic/Details/Messages/Message';
import { render } from '@testing-library/react';

const setupWrapper = (props?: Partial<TopicMessage>) => (
  <table>
    <tbody>
      <Message
        message={{
          timestamp: new Date(0),
          timestampType: TopicMessageTimestampTypeEnum.CREATE_TIME,
          offset: 0,
          key: '"test-key',
          partition: 0,
          content: '{"data": "test"}',
          headers: { header: 'test' },
          ...props,
        }}
      />
    </tbody>
  </table>
);

describe('Message component', () => {
  it('matches the snapshot', () => {
    const component = render(setupWrapper());
    expect(component.baseElement).toMatchSnapshot();
  });
});
