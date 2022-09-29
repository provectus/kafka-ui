import { TextEncoder } from 'util';

import React from 'react';
import { screen } from '@testing-library/react';
import MessageContent, {
  MessageContentProps,
} from 'components/Topics/Topic/Messages/MessageContent/MessageContent';
import { TopicMessageTimestampTypeEnum } from 'generated-sources';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import theme from 'theme/theme';

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
    it('makes key tab active', () => {
      const keyTab = screen.getAllByText('Key');
      userEvent.click(keyTab[0]);
      expect(keyTab[0]).toHaveStyleRule(
        'background-color',
        theme.secondaryTab.backgroundColor.active
      );
    });
  });

  describe('when switched to display the headers', () => {
    it('makes Headers tab active', () => {
      userEvent.click(screen.getByText('Headers'));
      expect(screen.getByText('Headers')).toHaveStyleRule(
        'background-color',
        theme.secondaryTab.backgroundColor.active
      );
    });
  });

  describe('when switched to display the content', () => {
    it('makes content tab active', () => {
      const contentTab = screen.getAllByText('Content');
      userEvent.click(contentTab[0]);
      expect(contentTab[0]).toHaveStyleRule(
        'background-color',
        theme.secondaryTab.backgroundColor.active
      );
    });
  });
});

describe('checking content type depend on message type', () => {
  it('renders component with message having JSON type', () => {
    render(
      setupWrapper({
        messageContentFormat: 'JSON',
        messageContent: '{"data": "test"}',
      })
    );
    expect(screen.getAllByText('JSON')[1]).toBeInTheDocument();
  });
  it('renders component with message having AVRO type', () => {
    render(
      setupWrapper({
        messageContentFormat: 'AVRO',
        messageContent: '{"data": "test"}',
      })
    );
    expect(screen.getByText('AVRO')).toBeInTheDocument();
  });
  it('renders component with message having PROTOBUF type', () => {
    render(
      setupWrapper({
        messageContentFormat: 'PROTOBUF',
        messageContent: proto,
      })
    );
    expect(screen.getByText('PROTOBUF')).toBeInTheDocument();
  });
  it('renders component with message having no type which is equal to having PROTOBUF type', () => {
    render(
      setupWrapper({
        messageContentFormat: 'PROTOBUF',
        messageContent: '',
      })
    );
    expect(screen.getByText('PROTOBUF')).toBeInTheDocument();
  });
});
