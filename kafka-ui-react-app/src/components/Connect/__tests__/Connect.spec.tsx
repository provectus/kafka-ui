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
  new: 'New Page',
  list: 'List Page',
  details: 'Details Page',
  edit: 'Edit Page',
};

jest.mock('components/Connect/New/New', () => () => (
  <div>{ConnectCompText.new}</div>
));
jest.mock('components/Connect/List/ListPage', () => () => (
  <div>{ConnectCompText.list}</div>
));
jest.mock('components/Connect/Details/DetailsPage', () => () => (
  <div>{ConnectCompText.details}</div>
));
jest.mock('components/Connect/Edit/Edit', () => () => (
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

  it('renders ListPage', () => {
    renderComponent(
      clusterConnectorsPath('my-cluster'),
      clusterConnectorsPath()
    );
    expect(screen.getByText(ConnectCompText.list)).toBeInTheDocument();
  });

  it('renders New Page', () => {
    renderComponent(
      clusterConnectorNewPath('my-cluster'),
      clusterConnectorsPath()
    );
    expect(screen.getByText(ConnectCompText.new)).toBeInTheDocument();
  });

  it('renders Details Page', () => {
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
