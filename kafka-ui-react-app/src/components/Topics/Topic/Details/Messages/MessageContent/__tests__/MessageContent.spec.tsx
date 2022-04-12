import { TextEncoder } from 'util';

import React from 'react';
import { screen } from '@testing-library/react';
import MessageContent, {
  MessageContentProps,
} from 'components/Topics/Topic/Details/Messages/MessageContent/MessageContent';
import { TopicMessageTimestampTypeEnum } from 'generated-sources';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';

const setupWrapper = (props?: Partial<MessageContentProps>) => {
  return (
    <table>
      <tbody>
        <MessageContent
          messageKey='"test-key"'
          messageKeyFormat="JSON"
          messageContent='{"data": "test"}'
          messageContentFormat="AVRO"
          headers={{ header: 'test' }}
          timestamp={new Date(0)}
          timestampType={TopicMessageTimestampTypeEnum.CREATE_TIME}
          {...props}
        />
      </tbody>
    </table>
  );
};

const proto =
  'syntax = "proto3";\npackage com.provectus;\n\nmessage TestProtoRecord {\n  string f1 = 1;\n  int32 f2 = 2;\n}\n';

global.TextEncoder = TextEncoder;

describe('MessageContent screen', () => {
  beforeEach(() => {
    render(setupWrapper());
  });

  describe('renders', () => {
    it('key format in document', () => {
      expect(screen.getByText('JSON')).toBeInTheDocument();
    });

    it('content format in document', () => {
      expect(screen.getByText('AVRO')).toBeInTheDocument();
    });
  });

  describe('when switched to display the key', () => {
    it('has a tab with is-active classname', () => {
      const keyTab = screen.getAllByText('Key');
      userEvent.click(keyTab[0]);
      expect(keyTab[0]).toHaveClass('is-active');
    });
    it('displays the key in the EditorViewer', () => {
      const keyTab = screen.getAllByText('Key');
      userEvent.click(keyTab[0]);
      expect(screen.getByTestId('json-viewer')).toBeInTheDocument();
    });
  });

  describe('when switched to display the headers', () => {
    it('has a tab with is-active classname', () => {
      userEvent.click(screen.getByText('Headers'));
      expect(screen.getByText('Headers')).toHaveClass('is-active');
    });
    it('displays the key in the EditorViewer', () => {
      userEvent.click(screen.getByText('Headers'));
      expect(screen.getByTestId('json-viewer')).toBeInTheDocument();
    });
  });

  describe('when switched to display the content', () => {
    it('has a tab with is-active classname', () => {
      userEvent.click(screen.getByText('Headers'));
      const contentTab = screen.getAllByText('Content');
      userEvent.click(contentTab[0]);
      expect(contentTab[0]).toHaveClass('is-active');
    });
  });
});

describe('render with different types of content', () => {
  it('renders with JSON', () => {
    render(
      setupWrapper({
        messageContentFormat: 'JSON',
        messageContent: '{"data": "test"}',
      })
    );
    expect(screen.getByTestId('message-content-format')).toHaveTextContent(
      'JSON'
    );
  });
  it('renders with AVRO', () => {
    render(
      setupWrapper({
        messageContentFormat: 'AVRO',
        messageContent: '{"data": "test"}',
      })
    );
    expect(screen.getByTestId('message-content-format')).toHaveTextContent(
      'AVRO'
    );
  });
  it('renders with PROTOBUF', () => {
    render(
      setupWrapper({
        messageContentFormat: 'PROTOBUF',
        messageContent: proto,
      })
    );
    expect(screen.getByTestId('message-content-format')).toHaveTextContent(
      'PROTOBUF'
    );
  });
  it('renders with no type', () => {
    render(
      setupWrapper({
        messageContentFormat: 'PROTOBUF',
        messageContent: '',
      })
    );
    expect(screen.getByTestId('message-content-format')).toHaveTextContent(
      'PROTOBUF'
    );
  });
});
