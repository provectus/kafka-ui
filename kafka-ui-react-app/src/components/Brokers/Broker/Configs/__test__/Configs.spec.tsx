import React from 'react';
import { screen } from '@testing-library/dom';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterBrokerConfigsPath } from 'lib/paths';
import { useBrokerConfig } from 'lib/hooks/api/brokers';
import { brokerConfigPayload } from 'lib/fixtures/brokers';
import Configs from 'components/Brokers/Broker/Configs/Configs';

const clusterName = 'Cluster_Name';
const brokerId = 'Broker_Id';

jest.mock('lib/hooks/api/brokers', () => ({
  useBrokerConfig: jest.fn(),
  useUpdateBrokerConfigByName: jest.fn(),
}));

describe('Configs', () => {
  const renderComponent = () => {
    const path = clusterBrokerConfigsPath(clusterName, brokerId);
    return render(
      <WithRoute path={clusterBrokerConfigsPath()}>
        <Configs />
      </WithRoute>,
      { initialEntries: [path] }
    );
  };

  beforeEach(() => {
    (useBrokerConfig as jest.Mock).mockImplementation(() => ({
      data: brokerConfigPayload,
    }));
    renderComponent();
  });

  it('renders', () => {
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toEqual(
      brokerConfigPayload.length + 1
    );
  });
});
