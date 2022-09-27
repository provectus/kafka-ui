import { waitFor } from '@testing-library/react';
import { renderQueryHook } from 'lib/testHelpers';
import * as hooks from 'lib/hooks/api/topicMessages';
import fetchMock from 'fetch-mock';
import { UseQueryResult } from '@tanstack/react-query';
import { SerdeUsage } from 'generated-sources';

const clusterName = 'test-cluster';
const topicName = 'test-topic';

const expectQueryWorks = async (
  mock: fetchMock.FetchMockStatic,
  result: { current: UseQueryResult<unknown, unknown> }
) => {
  await waitFor(() => expect(result.current.isFetched).toBeTruthy());
  expect(mock.calls()).toHaveLength(1);
  expect(result.current.data).toBeDefined();
};

jest.mock('lib/errorHandling', () => ({
  ...jest.requireActual('lib/errorHandling'),
  showServerError: jest.fn(),
}));

describe('Topic Messages hooks', () => {
  beforeEach(() => fetchMock.restore());
  it('handles useSerdes', async () => {
    const path = `/api/clusters/${clusterName}/topic/${topicName}/serdes?use=SERIALIZE`;

    const mock = fetchMock.getOnce(path, {});
    const { result } = renderQueryHook(() =>
      hooks.useSerdes({ clusterName, topicName, use: SerdeUsage.SERIALIZE })
    );
    await expectQueryWorks(mock, result);
  });
});
