import { expectQueryWorks, renderQueryHook } from 'lib/testHelpers';
import * as hooks from 'lib/hooks/api/clusters';
import fetchMock from 'fetch-mock';
import { clustersPayload } from 'lib/fixtures/clusters';

const clusterName = 'test-cluster';

describe('Clusters hooks', () => {
  beforeEach(() => fetchMock.restore());
  describe('useClusters', () => {
    it('returns the correct data', async () => {
      const mock = fetchMock.getOnce('/api/clusters', clustersPayload);
      const { result } = renderQueryHook(() => hooks.useClusters());
      await expectQueryWorks(mock, result);
    });
  });
  describe('useClusterStats', () => {
    it('returns the correct data', async () => {
      const mock = fetchMock.getOnce(
        `/api/clusters/${clusterName}/stats`,
        clustersPayload
      );
      const { result } = renderQueryHook(() =>
        hooks.useClusterStats(clusterName)
      );
      await expectQueryWorks(mock, result);
    });
  });
});
