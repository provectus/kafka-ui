import React from 'react';
import { TopicMessage, TopicMessageTimestampTypeEnum } from 'generated-sources';
import Message, {
  Props,
} from 'components/Topics/Topic/Details/Messages/Message';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';

const messageContentText = 'messageContentText';

jest.mock(
  'components/Topics/Topic/Details/Messages/MessageContent/MessageContent',
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

  const renderComponent = (
    props: Partial<Props> = {
      message: mockMessage,
    }
  ) => {
    return render(
      <table>
        <tbody>
          <Message message={props.message || mockMessage} />
        </tbody>
      </table>
    );
  };

  it('shows the data in the table row', () => {
    renderComponent();
    expect(screen.getByText(mockMessage.content as string)).toBeInTheDocument();
    expect(screen.getByText(mockMessage.key as string)).toBeInTheDocument();
    expect(
      screen.getByText(
        dayjs(mockMessage.timestamp).format('MM.DD.YYYY HH:mm:ss')
      )
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

  it('should check the dropdown being visible during hover', () => {
    renderComponent();
    const text = 'Save as a file';
    const trElement = screen.getByRole('row');
    expect(screen.queryByText(text)).not.toBeInTheDocument();

    userEvent.hover(trElement);
    expect(screen.getByText(text)).toBeInTheDocument();

    userEvent.unhover(trElement);
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  });

  it('should check open Message Content functionality', () => {
    renderComponent();
    const messageToggleIcon = screen.getByRole('button', { hidden: true });
    expect(screen.queryByText(messageContentText)).not.toBeInTheDocument();
    userEvent.click(messageToggleIcon);
    expect(screen.getByText(messageContentText)).toBeInTheDocument();
  });
});
