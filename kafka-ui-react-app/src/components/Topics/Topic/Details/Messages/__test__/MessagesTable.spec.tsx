import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import MessagesTable from 'components/Topics/Topic/Details/Messages/MessagesTable';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { SeekDirection, SeekType } from 'generated-sources';
import userEvent from '@testing-library/user-event';
import TopicMessagesContext, {
  ContextProps,
} from 'components/contexts/TopicMessagesContext';

describe('MessagesTable', () => {
  const searchParams = new URLSearchParams(
    `?filterQueryType=STRING_CONTAINS&attempt=0&limit=100&seekDirection=${SeekDirection.FORWARD}&seekType=${SeekType.OFFSET}&seekTo=0::9`
  );
  const contextValue: ContextProps = {
    isLive: false,
    seekDirection: SeekDirection.FORWARD,
    searchParams,
    changeSeekDirection: jest.fn(),
  };

  const setUpComponent = (
    params: URLSearchParams = searchParams,
    ctx: ContextProps = contextValue
  ) => {
    const history = createMemoryHistory();
    history.push({
      search: params.toString(),
    });
    return render(
      <Router history={history}>
        <TopicMessagesContext.Provider value={ctx}>
          <MessagesTable />
        </TopicMessagesContext.Provider>
      </Router>
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

    it('should check if next button exist and check the click after next click', () => {
      const nextBtnElement = screen.getByText(/next/i);
      expect(nextBtnElement).toBeInTheDocument();
      userEvent.click(nextBtnElement);
      expect(screen.getByText(/No messages found/i)).toBeInTheDocument();
    });
  });

  describe('Custom Setup with different props value', () => {
    it('should check if next click is gone during isLive Param', () => {
      setUpComponent(searchParams, { ...contextValue, isLive: true });
      expect(screen.queryByText(/next/i)).not.toBeInTheDocument();
    });

    it('should check the display of the loader element', () => {
      setUpComponent(searchParams, { ...contextValue, isLive: true });
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
