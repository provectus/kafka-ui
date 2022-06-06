import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import { clusterBrokerPath } from 'lib/paths';
import Brokers from 'components/Brokers/Brokers';

const brokersList = 'brokersList';
const broker = 'brokers';

jest.mock('components/Brokers/BrokersList/BrokersList', () => () => (
  <div>{brokersList}</div>
));
jest.mock('components/Brokers/Broker/Broker', () => () => <div>{broker}</div>);

describe('Brokers Component', () => {
  const clusterName = 'clusterName';
  const brokerId = '1';
  const renderComponent = (path?: string) =>
    render(<Brokers />, {
      initialEntries: path ? [path] : undefined,
    });

  it('renders BrokersList', () => {
    renderComponent();
    expect(screen.getByText(brokersList)).toBeInTheDocument();
  });

  it('renders Broker', () => {
    renderComponent(clusterBrokerPath(clusterName, brokerId));
    expect(screen.getByText(broker)).toBeInTheDocument();
  });
});
