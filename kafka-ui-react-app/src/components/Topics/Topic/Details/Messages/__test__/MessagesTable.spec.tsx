import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import MessagesTable from 'components/Topics/Topic/Details/Messages/MessagesTable';
import { Router } from 'react-router-dom';
import { createMemoryHistory, MemoryHistory } from 'history';
import { SeekDirection, SeekType, TopicMessage } from 'generated-sources';
import TopicMessagesContext, {
  ContextProps,
} from 'components/contexts/TopicMessagesContext';
import {
  topicMessagePayload,
  topicMessagesMetaPayload,
} from 'redux/reducers/topicMessages/__test__/fixtures';

const mockTopicsMessages: TopicMessage[] = [{ ...topicMessagePayload }];

describe('MessagesTable', () => {
  const seekToResult = '&seekTo=0::9';
  const searchParamsValue = `?filterQueryType=STRING_CONTAINS&attempt=0&limit=100&seekDirection=${SeekDirection.FORWARD}&seekType=${SeekType.OFFSET}${seekToResult}`;
  const searchParams = new URLSearchParams(searchParamsValue);
  const contextValue: ContextProps = {
    isLive: false,
    seekDirection: SeekDirection.FORWARD,
    searchParams,
    changeSeekDirection: jest.fn(),
  };

  const setUpComponent = (
    params: URLSearchParams = searchParams,
    ctx: ContextProps = contextValue,
    messages: TopicMessage[] = [],
    isFetching?: boolean,
    customHistory?: MemoryHistory
  ) => {
    const history =
      customHistory ||
      createMemoryHistory({
        initialEntries: [params.toString()],
      });
    return render(
      <Router history={history}>
        <TopicMessagesContext.Provider value={ctx}>
          <MessagesTable />
        </TopicMessagesContext.Provider>
      </Router>,
      {
        preloadedState: {
          topicMessages: {
            messages,
            meta: {
              ...topicMessagesMetaPayload,
            },
            isFetching: !!isFetching,
          },
        },
      }
    );
  };

  describe('Default props Setup for MessagesTable component', () => {
    beforeEach(() => {
      setUpComponent();
    });

    it('should check the render', () => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should check the if no elements is rendered in the table', () => {
      expect(screen.getByText(/No messages found/i)).toBeInTheDocument();
    });
  });

  describe('Custom Setup with different props value', () => {
    it('should check if next click is gone during isLive Param', () => {
      setUpComponent(searchParams, { ...contextValue, isLive: true });
      expect(screen.queryByText(/next/i)).not.toBeInTheDocument();
    });

    it('should check the display of the loader element', () => {
      setUpComponent(searchParams, { ...contextValue, isLive: true }, [], true);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('should render Messages table with data', () => {
    beforeEach(() => {
      setUpComponent(searchParams, { ...contextValue }, mockTopicsMessages);
    });

    it('should check the rendering of the messages', () => {
      expect(screen.queryByText(/No messages found/i)).not.toBeInTheDocument();
      expect(
        screen.getByText(mockTopicsMessages[0].content as string)
      ).toBeInTheDocument();
    });
  });
});
