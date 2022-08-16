import React from 'react';
import { connectors } from 'lib/fixtures/kafkaConnect';
import ClusterContext, {
  ContextProps,
  initialValue,
} from 'components/contexts/ClusterContext';
import List from 'components/Connect/List/List';
import { screen } from '@testing-library/react';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterConnectorsPath } from 'lib/paths';
import { useConnectors } from 'lib/hooks/api/kafkaConnect';

jest.mock('components/Connect/List/ListItem', () => () => (
  <tr>
    <td>List Item</td>
  </tr>
));
jest.mock('lib/hooks/api/kafkaConnect', () => ({
  useConnectors: jest.fn(),
}));

const clusterName = 'local';

describe('Connectors List', () => {
  const renderComponent = (contextValue: ContextProps = initialValue) =>
    render(
      <ClusterContext.Provider value={contextValue}>
        <WithRoute path={clusterConnectorsPath()}>
          <List />
        </WithRoute>
      </ClusterContext.Provider>,
      { initialEntries: [clusterConnectorsPath(clusterName)] }
    );

  it('renders empty connectors Table', async () => {
    (useConnectors as jest.Mock).mockImplementation(() => ({
      data: [],
    }));

    await renderComponent();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('No connectors found')).toBeInTheDocument();
  });

  it('renders connectors Table', async () => {
    (useConnectors as jest.Mock).mockImplementation(() => ({
      data: connectors,
    }));
    await renderComponent();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByText('List Item').length).toEqual(2);
  });
});
