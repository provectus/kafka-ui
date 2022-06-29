import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import { clusterBrokerPath } from 'lib/paths';
import Brokers from 'components/Brokers/Brokers';
import { translateLogdirs } from 'components/Brokers/utils/translateLogdirs';

import {
  brokerLogDirsPayload,
  transformedBrokerLogDirsPayload,
} from './fixtures';

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
  describe('translateLogdirs', () => {
    it('returns empty array when broker logdirs is not defined', () => {
      expect(translateLogdirs(undefined)).toEqual([]);
    });
    it('returns transformed  LogDirs  array when broker logdirs defined', () => {
      expect(translateLogdirs(brokerLogDirsPayload)).toEqual(
        transformedBrokerLogDirsPayload
      );
    });
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
