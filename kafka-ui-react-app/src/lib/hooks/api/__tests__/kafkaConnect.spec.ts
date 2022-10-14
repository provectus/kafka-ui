import { act, renderHook, waitFor } from '@testing-library/react';
import {
  expectQueryWorks,
  renderQueryHook,
  TestQueryClientProvider,
} from 'lib/testHelpers';
import * as hooks from 'lib/hooks/api/kafkaConnect';
import fetchMock from 'fetch-mock';
import { connectors, connects, tasks } from 'lib/fixtures/kafkaConnect';
import { ConnectorAction } from 'generated-sources';

const clusterName = 'test-cluster';
const connectName = 'test-connect';
const connectorName = 'test-connector';

const connectsPath = `/api/clusters/${clusterName}/connects`;
const connectorsPath = `/api/clusters/${clusterName}/connectors`;
const connectorPath = `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`;

const connectorProps = {
  clusterName,
  connectName,
  connectorName,
};

describe('kafkaConnect hooks', () => {
  beforeEach(() => fetchMock.restore());
  describe('useConnects', () => {
    it('returns the correct data', async () => {
      const mock = fetchMock.getOnce(connectsPath, connects);
      const { result } = renderQueryHook(() => hooks.useConnects(clusterName));
      await expectQueryWorks(mock, result);
    });
  });
  describe('useConnectors', () => {
    it('returns the correct data', async () => {
      const mock = fetchMock.getOnce(connectorsPath, connectors);
      const { result } = renderQueryHook(() =>
        hooks.useConnectors(clusterName)
      );
      await expectQueryWorks(mock, result);
    });

    it('returns the correct data for request with search criteria', async () => {
      const search = 'test-search';
      const mock = fetchMock.getOnce(
        `${connectorsPath}?search=${search}`,
        connectors
      );
      const { result } = renderQueryHook(() =>
        hooks.useConnectors(clusterName, search)
      );
      await expectQueryWorks(mock, result);
    });
  });
  describe('useConnector', () => {
    it('returns the correct data', async () => {
      const mock = fetchMock.getOnce(connectorPath, connectors[0]);
      const { result } = renderQueryHook(() =>
        hooks.useConnector(connectorProps)
      );
      await expectQueryWorks(mock, result);
    });
  });
  describe('useConnectorTasks', () => {
    it('returns the correct data', async () => {
      const mock = fetchMock.getOnce(`${connectorPath}/tasks`, tasks);
      const { result } = renderQueryHook(() =>
        hooks.useConnectorTasks(connectorProps)
      );
      await expectQueryWorks(mock, result);
    });
  });
  describe('useConnectorConfig', () => {
    it('returns the correct data', async () => {
      const mock = fetchMock.getOnce(`${connectorPath}/config`, {});
      const { result } = renderQueryHook(() =>
        hooks.useConnectorConfig(connectorProps)
      );
      await expectQueryWorks(mock, result);
    });
  });

  describe('mutatations', () => {
    describe('useUpdateConnectorState', () => {
      it('returns the correct data', async () => {
        const action = ConnectorAction.RESTART;
        const uri = `${connectorPath}/action/${action}`;
        const mock = fetchMock.postOnce(uri, connectors[0]);
        const { result } = renderHook(
          () => hooks.useUpdateConnectorState(connectorProps),
          { wrapper: TestQueryClientProvider }
        );
        await act(() => result.current.mutateAsync(action));
        await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
        expect(mock.calls()).toHaveLength(1);
      });
    });
    describe('useRestartConnectorTask', () => {
      it('returns the correct data', async () => {
        const taskId = 123456;
        const uri = `${connectorPath}/tasks/${taskId}/action/restart`;
        const mock = fetchMock.postOnce(uri, {});
        const { result } = renderHook(
          () => hooks.useRestartConnectorTask(connectorProps),
          { wrapper: TestQueryClientProvider }
        );
        await act(() => result.current.mutateAsync(taskId));
        await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
        expect(mock.calls()).toHaveLength(1);
      });
    });
    describe('useUpdateConnectorConfig', () => {
      it('returns the correct data', async () => {
        const mock = fetchMock.putOnce(`${connectorPath}/config`, {});
        const { result } = renderHook(
          () => hooks.useUpdateConnectorConfig(connectorProps),
          { wrapper: TestQueryClientProvider }
        );
        await act(async () => {
          await result.current.mutateAsync({ config: 1 });
        });
        await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
        expect(mock.calls()).toHaveLength(1);
      });
    });
    describe('useCreateConnector', () => {
      it('returns the correct data', async () => {
        const mock = fetchMock.postOnce(
          `${connectsPath}/${connectName}/connectors`,
          {}
        );
        const { result } = renderHook(
          () => hooks.useCreateConnector(clusterName),
          { wrapper: TestQueryClientProvider }
        );
        await act(async () => {
          await result.current.mutateAsync({
            connectName,
            newConnector: { name: connectorName, config: { a: 1 } },
          });
        });
        await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
        expect(mock.calls()).toHaveLength(1);
      });
    });
    describe('useDeleteConnector', () => {
      it('returns the correct data', async () => {
        const mock = fetchMock.deleteOnce(connectorPath, {});
        const { result } = renderHook(
          () => hooks.useDeleteConnector(connectorProps),
          { wrapper: TestQueryClientProvider }
        );
        await act(async () => {
          await result.current.mutateAsync();
        });
        await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
        expect(mock.calls()).toHaveLength(1);
      });
    });
  });
});
