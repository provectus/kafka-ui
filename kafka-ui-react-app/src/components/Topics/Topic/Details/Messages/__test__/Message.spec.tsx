import React from 'react';
import { TopicMessageTimestampTypeEnum } from 'generated-sources';
import Message from 'components/Topics/Topic/Details/Messages/Message';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

describe('Message component', () => {
  it('shows the data in the table row', async () => {
    render(
      <table>
        <tbody>
          <Message
            message={{
              timestamp: new Date(0),
              timestampType: TopicMessageTimestampTypeEnum.CREATE_TIME,
              offset: 0,
              key: 'test-key',
              partition: 0,
              content: '{"data": "test"}',
              headers: { header: 'test' },
            }}
          />
        </tbody>
      </table>
    );
    expect(screen.getByText('{"data": "test"}')).toBeInTheDocument();
    expect(screen.getByText('test-key')).toBeInTheDocument();
  });
});
