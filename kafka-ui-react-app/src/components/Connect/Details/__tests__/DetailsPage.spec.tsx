import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import {
  clusterConnectConnectorConfigPath,
  clusterConnectConnectorPath,
  clusterConnectConnectorTasksPath,
  getNonExactPath,
} from 'lib/paths';
import { screen } from '@testing-library/dom';

import DetailsPage from '../DetailsPage';

const DetailsCompText = {
  overview: 'Overview Page',
  tasks: 'Tasks Page',
  config: 'Config Page',
  actions: 'Actions Page',
};

jest.mock('components/Connect/Details/Overview/Overview', () => () => (
  <div>{DetailsCompText.overview}</div>
));

jest.mock('components/Connect/Details/Tasks/TasksContainer', () => () => (
  <div>{DetailsCompText.tasks}</div>
));

jest.mock('components/Connect/Details/Config/Config', () => () => (
  <div>{DetailsCompText.config}</div>
));

jest.mock('components/Connect/Details/Actions/ActionsContainer', () => () => (
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

  const setupWrapper = (path: string = defaultPath) =>
    render(
      <WithRoute path={getNonExactPath(clusterConnectConnectorPath())}>
        <DetailsPage />
      </WithRoute>,
      { initialEntries: [path] }
    );

  describe('Router component tests', () => {
    it('should test if overview is rendering', () => {
      setupWrapper();
      expect(screen.getByText(DetailsCompText.overview));
    });

    it('should test if tasks is rendering', () => {
      setupWrapper(
        clusterConnectConnectorTasksPath(
          clusterName,
          connectName,
          connectorName
        )
      );
      expect(screen.getByText(DetailsCompText.tasks));
    });

    it('should test if list is rendering', () => {
      setupWrapper(
        clusterConnectConnectorConfigPath(
          clusterName,
          connectName,
          connectorName
        )
      );
      expect(screen.getByText(DetailsCompText.config));
    });
  });
});
