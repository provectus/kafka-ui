import {
  fetchConnector,
  fetchConnectorConfig,
  fetchConnectors,
  fetchConnectorTasks,
  fetchConnects,
} from 'redux/reducers/connect/connectSlice';
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
      store.dispatch({
        type: fetchConnects.fulfilled.type,
        payload: { connects },
      });
      expect(selectors.getConnects(store.getState())).toEqual(connects);
    });

    it('returns connectors', () => {
      store.dispatch({
        type: fetchConnectors.fulfilled.type,
        payload: { connectors },
      });
      expect(selectors.getConnectors(store.getState())).toEqual(connectors);
    });

    it('returns connector', () => {
      store.dispatch({
        type: fetchConnector.fulfilled.type,
        payload: { connector },
      });
      expect(selectors.getConnector(store.getState())).toEqual(connector);
      expect(selectors.getConnectorStatus(store.getState())).toEqual(
        connector.status.state
      );
    });

    it('returns connector tasks', () => {
      store.dispatch({
        type: fetchConnectorTasks.fulfilled.type,
        payload: { tasks },
      });
      expect(selectors.getConnectorTasks(store.getState())).toEqual(tasks);
      expect(selectors.getConnectorRunningTasksCount(store.getState())).toEqual(
        2
      );
      expect(selectors.getConnectorFailedTasksCount(store.getState())).toEqual(
        1
      );
    });

    it('returns connector config', () => {
      store.dispatch({
        type: fetchConnectorConfig.fulfilled.type,
        payload: { config: connector.config },
      });
      expect(selectors.getConnectorConfig(store.getState())).toEqual(
        connector.config
      );
    });
  });
});
