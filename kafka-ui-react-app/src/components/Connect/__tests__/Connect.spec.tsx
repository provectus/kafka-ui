import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import Connect from 'components/Connect/Connect';
import { store } from 'redux/store';
import { Route } from 'react-router-dom';
import {
  clusterConnectorsPath,
  clusterConnectorNewPath,
  clusterConnectConnectorPath,
  clusterConnectConnectorEditPath,
} from 'lib/paths';

jest.mock('components/Connect/New/NewContainer', () => () => (
  <div>NewContainer</div>
));
jest.mock('components/Connect/List/ListContainer', () => () => (
  <div>ListContainer</div>
));
jest.mock('components/Connect/Details/DetailsContainer', () => () => (
  <div>DetailsContainer</div>
));
jest.mock('components/Connect/Edit/EditContainer', () => () => (
  <div>EditContainer</div>
));

describe('Connect', () => {
  const renderComponent = (pathname: string) =>
    render(
      <Route path="/ui/clusters/:clusterName">
        <Connect />
      </Route>,
      { pathname, store }
    );

  it('renders ListContainer', () => {
    renderComponent(clusterConnectorsPath('my-cluster'));
    expect(screen.getByText('ListContainer')).toBeInTheDocument();
  });

  it('renders NewContainer', () => {
    renderComponent(clusterConnectorNewPath('my-cluster'));
    expect(screen.getByText('NewContainer')).toBeInTheDocument();
  });

  it('renders DetailsContainer', () => {
    renderComponent(
      clusterConnectConnectorPath('my-cluster', 'my-connect', 'my-connector')
    );
    expect(screen.getByText('DetailsContainer')).toBeInTheDocument();
  });

  it('renders EditContainer', () => {
    renderComponent(
      clusterConnectConnectorEditPath(
        'my-cluster',
        'my-connect',
        'my-connector'
      )
    );
    expect(screen.getByText('EditContainer')).toBeInTheDocument();
  });
});
