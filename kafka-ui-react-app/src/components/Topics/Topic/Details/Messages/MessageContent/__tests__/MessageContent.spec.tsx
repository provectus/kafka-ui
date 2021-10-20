import { TextEncoder } from 'util';

import { fireEvent, render, waitFor } from '@testing-library/react';
import MessageContent, {
  MessageContentProps,
} from 'components/Topics/Topic/Details/Messages/MessageContent/MessageContent';
import { TopicMessageTimestampTypeEnum } from 'generated-sources';
import React from 'react';
import { ThemeProvider } from 'styled-components';
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

describe('MessageContent component', () => {
  it('matches snapshot', () => {
    const component = render(setupWrapper());
    expect(component.baseElement).toMatchSnapshot();
  });

  describe('when switched to display the key', () => {
    it('has a tab with is-active classname', async () => {
      const component = render(setupWrapper());
      const keyTab = await component.findAllByText('Key');
      fireEvent.click(keyTab[0]);
      await waitFor(async () => {
        expect(keyTab[0]).toHaveClass('is-active');
      });
    });
    it('displays the key in the JSONViewer', async () => {
      const component = render(setupWrapper());
      const keyTab = await component.findAllByText('Key');
      fireEvent.click(keyTab[0]);
      const JSONViewer = await component.findByText('"test-key"');
      await waitFor(async () => {
        expect(JSONViewer).toBeTruthy();
      });
    });
  });

  describe('when switched to display the headers', () => {
    it('has a tab with is-active classname', async () => {
      const component = render(setupWrapper());
      const headersTab = await component.findByText('Headers');
      fireEvent.click(headersTab);
      await waitFor(async () => {
        expect(headersTab).toHaveClass('is-active');
      });
    });
    it('displays the key in the JSONViewer', async () => {
      const component = render(setupWrapper());
      const headersTab = await component.findByText('Headers');
      fireEvent.click(headersTab);
      const JSONViewer = await component.findByText('header:');
      await waitFor(async () => {
        expect(JSONViewer).toBeTruthy();
      });
    });
  });
});
