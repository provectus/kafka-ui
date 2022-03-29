import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import MessagesTable from 'components/Topics/Topic/Details/Messages/MessagesTable';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { SeekDirection, SeekType } from 'generated-sources';

describe('MessagesTable', () => {
  const searchParams = `?filterQueryType=STRING_CONTAINS&attempt=0&limit=100&seekDirection=${SeekDirection.FORWARD}&seekType=${SeekType.OFFSET}&seekTo=0::9`;
  const setUpComponent = (params = searchParams) => {
    const history = createMemoryHistory();
    history.push({
      search: new URLSearchParams(params).toString(),
    });
    return render(
      <Router history={history}>
        <MessagesTable />
      </Router>
    );
  };

  describe('Default Search Params', () => {
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

  describe('Custom Search Params', () => {});
});
