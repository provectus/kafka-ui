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
          keySerde="SchemaRegistry"
          valueSerde="Avro"
          {...props}
        />
      </tbody>
    </table>
  );
};

global.TextEncoder = TextEncoder;

describe('MessageContent screen', () => {
  beforeEach(() => {
    render(setupWrapper());
  });

  describe('Checking keySerde and valueSerde', () => {
    it('keySerde in document', () => {
      expect(screen.getByText('SchemaRegistry')).toBeInTheDocument();
    });

    it('valueSerde in document', () => {
      expect(screen.getByText('Avro')).toBeInTheDocument();
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
