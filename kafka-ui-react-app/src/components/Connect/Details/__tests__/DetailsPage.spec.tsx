import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import {
  clusterConnectConnectorConfigPath,
  clusterConnectConnectorPath,
  getNonExactPath,
} from 'lib/paths';
import { screen } from '@testing-library/dom';
import DetailsPage from 'components/Connect/Details/DetailsPage';

const DetailsCompText = {
  overview: 'Overview Pane',
  tasks: 'Tasks Page',
  config: 'Config Page',
  actions: 'Actions',
};

jest.mock('components/Connect/Details/Overview/Overview', () => () => (
  <div>{DetailsCompText.overview}</div>
));

jest.mock('components/Connect/Details/Tasks/Tasks', () => () => (
  <div>{DetailsCompText.tasks}</div>
));

jest.mock('components/Connect/Details/Config/Config', () => () => (
  <div>{DetailsCompText.config}</div>
));

jest.mock('components/Connect/Details/Actions/Actions', () => () => (
  <div>{DetailsCompText.actions}</div>
));

describe('Details Page', () => {
  const clusterName = 'my-cluster';
  const connectName = 'my-connect';
  const connectorName = 'my-connector';
  const defaultPath = clusterConnectConnectorPath(
    clusterName,
    connectName,
    connectorName
  );

  const renderComponent = (path: string = defaultPath) =>
    render(
      <WithRoute path={getNonExactPath(clusterConnectConnectorPath())}>
        <DetailsPage />
      </WithRoute>,
      { initialEntries: [path] }
    );

  it('renders actions', () => {
    renderComponent();
    expect(screen.getByText(DetailsCompText.actions));
  });

  it('renders overview pane', () => {
    renderComponent();
    expect(screen.getByText(DetailsCompText.overview));
  });

  describe('Router component tests', () => {
    it('should test if tasks is rendering', () => {
      renderComponent();
      expect(screen.getByText(DetailsCompText.tasks));
    });

    it('should test if list is rendering', () => {
      const path = clusterConnectConnectorConfigPath(
        clusterName,
        connectName,
        connectorName
      );
      renderComponent(path);
      expect(screen.getByText(DetailsCompText.config));
    });
  });
});
