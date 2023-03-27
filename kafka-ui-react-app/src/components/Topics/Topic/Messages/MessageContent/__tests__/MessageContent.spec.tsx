import { TextEncoder } from 'util';

import React from 'react';
import { screen } from '@testing-library/react';
import MessageContent, {
  MessageContentProps,
} from 'components/Topics/Topic/Messages/MessageContent/MessageContent';
import { TopicMessageTimestampTypeEnum } from 'generated-sources';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import { theme } from 'theme/theme';

const setupWrapper = (props?: Partial<MessageContentProps>) => {
  return (
    <table>
      <tbody>
        <MessageContent
          messageKey='"test-key"'
          messageContent='{"data": "test"}'
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

const searchParamsContentAVRO = new URLSearchParams({
  keySerde: 'SchemaRegistry',
  valueSerde: 'AVRO',
  limit: '100',
});
const searchParamsContentJSON = new URLSearchParams({
  keySerde: 'SchemaRegistry',
  valueSerde: 'JSON',
  limit: '100',
});
const searchParamsContentPROTOBUF = new URLSearchParams({
  keySerde: 'SchemaRegistry',
  valueSerde: 'PROTOBUF',
  limit: '100',
});
describe('MessageContent screen', () => {
  beforeEach(() => {
    render(setupWrapper(), {
      initialEntries: [`/messages?${searchParamsContentAVRO}`],
    });
  });

  describe('renders', () => {
    it('key format in document', () => {
      expect(screen.getByText('SchemaRegistry')).toBeInTheDocument();
    });

    it('content format in document', () => {
      expect(screen.getByText('AVRO')).toBeInTheDocument();
    });
  });

  describe('when switched to display the key', () => {
    it('makes key tab active', async () => {
      const keyTab = screen.getAllByText('Key');
      await userEvent.click(keyTab[0]);
      expect(keyTab[0]).toHaveStyleRule(
        'background-color',
        theme.secondaryTab.backgroundColor.active
      );
    });
  });

  describe('when switched to display the headers', () => {
    it('makes Headers tab active', async () => {
      await userEvent.click(screen.getByText('Headers'));
      expect(screen.getByText('Headers')).toHaveStyleRule(
        'background-color',
        theme.secondaryTab.backgroundColor.active
      );
    });
  });

  describe('when switched to display the value', () => {
    it('makes value tab active', async () => {
      const contentTab = screen.getAllByText('Value');
      await userEvent.click(contentTab[0]);
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
        messageContent: '{"data": "test"}',
      }),
      { initialEntries: [`/messages?${searchParamsContentJSON}`] }
    );
    expect(screen.getByText('JSON')).toBeInTheDocument();
  });
  it('renders component with message having AVRO type', () => {
    render(
      setupWrapper({
        messageContent: '{"data": "test"}',
      }),
      { initialEntries: [`/messages?${searchParamsContentAVRO}`] }
    );
    expect(screen.getByText('AVRO')).toBeInTheDocument();
  });
  it('renders component with message having PROTOBUF type', () => {
    render(
      setupWrapper({
        messageContent: proto,
      }),
      { initialEntries: [`/messages?${searchParamsContentPROTOBUF}`] }
    );
    expect(screen.getByText('PROTOBUF')).toBeInTheDocument();
  });
  it('renders component with message having no type which is equal to having PROTOBUF type', () => {
    render(
      setupWrapper({
        messageContent: '',
      }),
      { initialEntries: [`/messages?${searchParamsContentPROTOBUF}`] }
    );
    expect(screen.getByText('PROTOBUF')).toBeInTheDocument();
  });
});
