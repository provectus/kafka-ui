import React from 'react';
import { TopicMessage, TopicMessageTimestampTypeEnum } from 'generated-sources';
import Message, {
  PreviewFilter,
  Props,
} from 'components/Topics/Topic/Messages/Message';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';
import { formatTimestamp } from 'lib/dateTimeHelpers';

const messageContentText = 'messageContentText';

const keyTest = '{"payload":{"subreddit":"learnprogramming"}}';
const contentTest =
  '{"payload":{"author":"DwaywelayTOP","archived":false,"name":"t3_11jshwd","id":"11jshwd"}}';
jest.mock(
  'components/Topics/Topic/Messages/MessageContent/MessageContent',
  () => () =>
    (
      <tr>
        <td>{messageContentText}</td>
      </tr>
    )
);

describe('Message component', () => {
  const mockMessage: TopicMessage = {
    timestamp: new Date(),
    timestampType: TopicMessageTimestampTypeEnum.CREATE_TIME,
    offset: 0,
    key: 'test-key',
    partition: 6,
    content: '{"data": "test"}',
    headers: { header: 'test' },
  };
  const mockKeyFilters: PreviewFilter = {
    field: 'sub',
    path: '$.payload.subreddit',
  };
  const mockContentFilters: PreviewFilter = {
    field: 'author',
    path: '$.payload.author',
  };
  const renderComponent = (
    props: Partial<Props> = {
      message: mockMessage,
      keyFilters: [],
      contentFilters: [],
    }
  ) =>
    render(
      <table>
        <tbody>
          <Message
            message={props.message || mockMessage}
            keyFilters={props.keyFilters || []}
            contentFilters={props.contentFilters || []}
          />
        </tbody>
      </table>
    );

  it('shows the data in the table row', () => {
    renderComponent();
    expect(screen.getByText(mockMessage.content as string)).toBeInTheDocument();
    expect(screen.getByText(mockMessage.key as string)).toBeInTheDocument();
    expect(
      screen.getByText(formatTimestamp(mockMessage.timestamp))
    ).toBeInTheDocument();
    expect(screen.getByText(mockMessage.offset.toString())).toBeInTheDocument();
    expect(
      screen.getByText(mockMessage.partition.toString())
    ).toBeInTheDocument();
  });

  it('check the useDataSaver functionality', () => {
    const props = { message: { ...mockMessage } };
    delete props.message.content;
    renderComponent(props);
    expect(
      screen.queryByText(mockMessage.content as string)
    ).not.toBeInTheDocument();
  });

  it('should check the dropdown being visible during hover', async () => {
    renderComponent();
    const text = 'Save as a file';
    const trElement = screen.getByRole('row');
    expect(screen.queryByText(text)).not.toBeInTheDocument();

    await userEvent.hover(trElement);
    expect(screen.getByText(text)).toBeInTheDocument();

    await userEvent.unhover(trElement);
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  });

  it('should check open Message Content functionality', async () => {
    renderComponent();
    const messageToggleIcon = screen.getByRole('button', { hidden: true });
    expect(screen.queryByText(messageContentText)).not.toBeInTheDocument();
    await userEvent.click(messageToggleIcon);
    expect(screen.getByText(messageContentText)).toBeInTheDocument();
  });

  it('should check if Preview filter showing for key', () => {
    const props = {
      message: { ...mockMessage, key: keyTest as string },
      keyFilters: [mockKeyFilters],
    };
    renderComponent(props);
    const keyFiltered = screen.getByText('sub: "learnprogramming"');
    expect(keyFiltered).toBeInTheDocument();
  });

  it('should check if Preview filter showing for Value', () => {
    const props = {
      message: { ...mockMessage, content: contentTest as string },
      contentFilters: [mockContentFilters],
    };
    renderComponent(props);
    const keyFiltered = screen.getByText('author: "DwaywelayTOP"');
    expect(keyFiltered).toBeInTheDocument();
  });
});
