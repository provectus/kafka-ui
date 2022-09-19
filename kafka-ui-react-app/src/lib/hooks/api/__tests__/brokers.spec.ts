import { waitFor } from '@testing-library/react';
import { renderQueryHook } from 'lib/testHelpers';
import * as hooks from 'lib/hooks/api/brokers';
import fetchMock from 'fetch-mock';
import { UseQueryResult } from '@tanstack/react-query';

const clusterName = 'test-cluster';
const brokerId = 1;
const brokersPath = `/api/clusters/${clusterName}/brokers`;
const brokerPath = `${brokersPath}/${brokerId}`;

const expectQueryWorks = async (
  mock: fetchMock.FetchMockStatic,
  result: { current: UseQueryResult<unknown, unknown> }
) => {
  await waitFor(() => expect(result.current.isFetched).toBeTruthy());
  expect(mock.calls()).toHaveLength(1);
  expect(result.current.data).toBeDefined();
};

describe('Brokers hooks', () => {
  beforeEach(() => fetchMock.restore());
  describe('useBrokers', () => {
    it('useBrokers', async () => {
      const mock = fetchMock.getOnce(brokersPath, []);
      const { result } = renderQueryHook(() => hooks.useBrokers(clusterName));
      await expectQueryWorks(mock, result);
    });
  });
  describe('useBrokerMetrics', () => {
    it('useBrokerMetrics', async () => {
      const mock = fetchMock.getOnce(`${brokerPath}/metrics`, {});
      const { result } = renderQueryHook(() =>
        hooks.useBrokerMetrics(clusterName, brokerId)
      );
      await expectQueryWorks(mock, result);
    });
  });
  describe('useBrokerLogDirs', () => {
    it('useBrokerLogDirs', async () => {
      const mock = fetchMock.getOnce(`${brokersPath}/logdirs?broker=1`, []);
      const { result } = renderQueryHook(() =>
        hooks.useBrokerLogDirs(clusterName, brokerId)
      );
      await expectQueryWorks(mock, result);
    });
  });
});
