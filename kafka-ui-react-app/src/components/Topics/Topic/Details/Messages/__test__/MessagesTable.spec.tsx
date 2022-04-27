import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import MessagesTable from 'components/Topics/Topic/Details/Messages/MessagesTable';
import { MemoryRouter } from 'react-router-dom';
import { createPath } from 'history';
import { SeekDirection, SeekType } from 'generated-sources';
import userEvent from '@testing-library/user-event';
import TopicMessagesContext, {
  ContextProps,
} from 'components/contexts/TopicMessagesContext';

describe('MessagesTable', () => {
  const search = `?filterQueryType=STRING_CONTAINS&attempt=0&limit=100&seekDirection=${SeekDirection.FORWARD}&seekType=${SeekType.OFFSET}&seekTo=0::9`;
  const contextValue: ContextProps = {
    isLive: false,
    seekDirection: SeekDirection.FORWARD,
    searchParams: new URLSearchParams(search),
    changeSeekDirection: jest.fn(),
  };

  const setUpComponent = (
    initialEntries?: string[],
    ctx: ContextProps = contextValue
  ) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <TopicMessagesContext.Provider value={ctx}>
          <MessagesTable />
        </TopicMessagesContext.Provider>
      </MemoryRouter>
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
      setUpComponent([createPath({ search })], {
        ...contextValue,
        isLive: true,
      });
      expect(screen.queryByText(/next/i)).not.toBeInTheDocument();
    });

    it('should check the display of the loader element', () => {
      setUpComponent([createPath({ search })], {
        ...contextValue,
        isLive: true,
      });
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
