import {
  fetchConnectorAction,
  fetchConnectorConfigAction,
  fetchConnectorsAction,
  fetchConnectorTasksAction,
  fetchConnectsAction,
} from 'redux/actions';
import { store } from 'redux/store';
import * as selectors from 'redux/reducers/connect/selectors';

import { connects, connectors, connector, tasks } from './fixtures';

describe('Connect selectors', () => {
  describe('Initial State', () => {
    it('returns initial values', () => {
      expect(selectors.getAreConnectsFetching(store.getState())).toEqual(false);
      expect(selectors.getConnects(store.getState())).toEqual([]);
      expect(selectors.getAreConnectorsFetching(store.getState())).toEqual(
        false
      );
      expect(selectors.getConnectors(store.getState())).toEqual([]);
      expect(selectors.getIsConnectorFetching(store.getState())).toEqual(false);
      expect(selectors.getConnector(store.getState())).toEqual(null);
      expect(selectors.getConnectorStatus(store.getState())).toEqual(undefined);
      expect(selectors.getIsConnectorDeleting(store.getState())).toEqual(false);
      expect(selectors.getIsConnectorRestarting(store.getState())).toEqual(
        false
      );
      expect(selectors.getIsConnectorPausing(store.getState())).toEqual(false);
      expect(selectors.getIsConnectorResuming(store.getState())).toEqual(false);
      expect(selectors.getIsConnectorActionRunning(store.getState())).toEqual(
        false
      );
      expect(selectors.getAreConnectorTasksFetching(store.getState())).toEqual(
        false
      );
      expect(selectors.getConnectorTasks(store.getState())).toEqual([]);
      expect(selectors.getConnectorRunningTasksCount(store.getState())).toEqual(
        0
      );
      expect(selectors.getConnectorFailedTasksCount(store.getState())).toEqual(
        0
      );
      expect(selectors.getIsConnectorConfigFetching(store.getState())).toEqual(
        false
      );
      expect(selectors.getConnectorConfig(store.getState())).toEqual(null);
    });
  });

  describe('state', () => {
    it('returns connects', () => {
      store.dispatch(fetchConnectsAction.success({ connects }));
      expect(selectors.getConnects(store.getState())).toEqual(connects);
    });

    it('returns connectors', () => {
      store.dispatch(fetchConnectorsAction.success({ connectors }));
      expect(selectors.getConnectors(store.getState())).toEqual(connectors);
    });

    it('returns connector', () => {
      store.dispatch(fetchConnectorAction.success({ connector }));
      expect(selectors.getConnector(store.getState())).toEqual(connector);
      expect(selectors.getConnectorStatus(store.getState())).toEqual(
        connector.status.state
      );
    });

    it('returns connector tasks', () => {
      store.dispatch(fetchConnectorTasksAction.success({ tasks }));
      expect(selectors.getConnectorTasks(store.getState())).toEqual(tasks);
      expect(selectors.getConnectorRunningTasksCount(store.getState())).toEqual(
        2
      );
      expect(selectors.getConnectorFailedTasksCount(store.getState())).toEqual(
        1
      );
    });

    it('returns connector config', () => {
      store.dispatch(
        fetchConnectorConfigAction.success({ config: connector.config })
      );
      expect(selectors.getConnectorConfig(store.getState())).toEqual(
        connector.config
      );
    });
  });
});
