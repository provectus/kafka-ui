import React from 'react';
import { Route, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { clusterKsqlDbPath } from 'lib/paths';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';
import ListItem from 'components/KsqlDb/List/ListItem';

const history = createMemoryHistory();
const clusterName = 'local';

const renderComponent = ({
  accessors,
  data,
}: {
  accessors: string[];
  data: Record<string, string>;
}) => {
  history.push(clusterKsqlDbPath(clusterName));
  render(
    <Router history={history}>
      <Route path={clusterKsqlDbPath(':clusterName')}>
        <ListItem accessors={accessors} data={data} />
      </Route>
    </Router>
  );
};

describe('KsqlDb List Item', () => {
  it('renders placeholder on one data', async () => {
    renderComponent({
      accessors: ['accessors'],
      data: { accessors: 'accessors text' },
    });

    expect(screen.getByText('accessors text')).toBeInTheDocument();
  });
});
