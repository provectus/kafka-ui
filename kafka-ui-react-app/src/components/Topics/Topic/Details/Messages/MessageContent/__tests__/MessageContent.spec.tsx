import { TextEncoder } from 'util';

import React from 'react';
import { ThemeProvider } from 'styled-components';
import { fireEvent, render, waitFor, screen } from '@testing-library/react';
import MessageContent, {
  MessageContentProps,
} from 'components/Topics/Topic/Details/Messages/MessageContent/MessageContent';
import { TopicMessageTimestampTypeEnum } from 'generated-sources';
import theme from 'theme/theme';

const setupWrapper = (props?: Partial<MessageContentProps>) => {
  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
};

global.TextEncoder = TextEncoder;

describe('MessageContent screen', () => {
  beforeEach(() => {
    render(setupWrapper());
  });
  describe('when switched to display the key', () => {
    it('has a tab with is-active classname', async () => {
      const keyTab = await screen.findAllByText('Key');
      fireEvent.click(keyTab[0]);
      await waitFor(async () => {
        expect(keyTab[0]).toHaveClass('is-active');
      });
    });
    it('displays the key in the JSONViewer', async () => {
      const keyTab = await screen.findAllByText('Key');
      fireEvent.click(keyTab[0]);
      const JSONViewer = await screen.getByTestId('json-viewer');
      await waitFor(async () => {
        expect(JSONViewer).toBeTruthy();
      });
    });
  });

  describe('when switched to display the headers', () => {
    it('has a tab with is-active classname', async () => {
      const headersTab = await screen.findByText('Headers');
      fireEvent.click(headersTab);
      await waitFor(async () => {
        expect(headersTab).toHaveClass('is-active');
      });
    });
    it('displays the key in the JSONViewer', async () => {
      const headersTab = await screen.findByText('Headers');
      fireEvent.click(headersTab);
      const JSONViewer = await screen.getByTestId('json-viewer');
      await waitFor(async () => {
        expect(JSONViewer).toBeTruthy();
      });
    });
  });

  describe('when switched to display the content', () => {
    it('has a tab with is-active classname', async () => {
      const headersTab = await screen.findByText('Headers');
      fireEvent.click(headersTab);
      await waitFor(async () => {
        const contentTab = await screen.findAllByText('Content');
        fireEvent.click(contentTab[0]);
        await waitFor(async () => {
          expect(contentTab[0]).toHaveClass('is-active');
        });
      });
    });
  });
});
