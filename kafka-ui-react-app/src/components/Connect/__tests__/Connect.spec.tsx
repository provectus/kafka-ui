import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import Connect from 'components/Connect/Connect';
import { store } from 'redux/store';
import {
  clusterConnectorsPath,
  clusterConnectorNewPath,
  clusterConnectConnectorPath,
  clusterConnectConnectorEditPath,
  getNonExactPath,
  clusterConnectsPath,
} from 'lib/paths';

const ConnectCompText = {
  new: 'NewContainer',
  list: 'ListContainer',
  details: 'DetailsContainer',
  edit: 'EditContainer',
};

jest.mock('components/Connect/New/NewContainer', () => () => (
  <div>{ConnectCompText.new}</div>
));
jest.mock('components/Connect/List/ListContainer', () => () => (
  <div>{ConnectCompText.list}</div>
));
jest.mock('components/Connect/Details/DetailsContainer', () => () => (
  <div>{ConnectCompText.details}</div>
));
jest.mock('components/Connect/Edit/EditContainer', () => () => (
  <div>{ConnectCompText.edit}</div>
));

describe('Connect', () => {
  const renderComponent = (pathname: string, routePath: string) =>
    render(
      <WithRoute path={getNonExactPath(routePath)}>
        <Connect />
      </WithRoute>,
      { initialEntries: [pathname], store }
    );

  it('renders ListContainer', () => {
    renderComponent(
      clusterConnectorsPath('my-cluster'),
      clusterConnectorsPath()
    );
    expect(screen.getByText(ConnectCompText.list)).toBeInTheDocument();
  });

  it('renders NewContainer', () => {
    renderComponent(
      clusterConnectorNewPath('my-cluster'),
      clusterConnectorsPath()
    );
    expect(screen.getByText(ConnectCompText.new)).toBeInTheDocument();
  });

  it('renders DetailsContainer', () => {
    renderComponent(
      clusterConnectConnectorPath('my-cluster', 'my-connect', 'my-connector'),
      clusterConnectsPath()
    );
    expect(screen.getByText(ConnectCompText.details)).toBeInTheDocument();
  });

  it('renders EditContainer', () => {
    renderComponent(
      clusterConnectConnectorEditPath(
        'my-cluster',
        'my-connect',
        'my-connector'
      ),
      clusterConnectsPath()
    );
    expect(screen.getByText(ConnectCompText.edit)).toBeInTheDocument();
  });
});
