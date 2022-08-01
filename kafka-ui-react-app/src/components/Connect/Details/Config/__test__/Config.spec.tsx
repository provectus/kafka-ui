import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterConnectConnectorConfigPath } from 'lib/paths';
import Config from 'components/Connect/Details/Config/Config';
import { screen } from '@testing-library/dom';
import { useConnectorConfig } from 'lib/hooks/api/kafkaConnect';
import { connector } from 'lib/fixtures/kafkaConnect';

jest.mock('components/common/Editor/Editor', () => () => (
  <div>mock-Editor</div>
));
jest.mock('lib/hooks/api/kafkaConnect', () => ({
  useConnectorConfig: jest.fn(),
}));

describe('Config', () => {
  const renderComponent = () =>
    render(
      <WithRoute path={clusterConnectConnectorConfigPath()}>
        <Config />
      </WithRoute>,
      {
        initialEntries: [
          clusterConnectConnectorConfigPath(
            'my-cluster',
            'my-connect',
            'my-connector'
          ),
        ],
      }
    );

  it('is empty when no config', () => {
    (useConnectorConfig as jest.Mock).mockImplementation(() => ({}));
    const { container } = renderComponent();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders editor', () => {
    (useConnectorConfig as jest.Mock).mockImplementation(() => ({
      data: connector.config,
    }));
    renderComponent();
    expect(screen.getByText('mock-Editor')).toBeInTheDocument();
  });
});
