import configureStore from 'redux/store/configureStore';
import { createTopicAction } from 'redux/actions';
import * as selectors from '../selectors';
import { failurePayloadWithId, failurePayloadWithoutId } from './fixtures';

const store = configureStore();

describe('Alerts selectors', () => {
  describe('Initial State', () => {
    it('returns empty alert list', () => {
      expect(selectors.getAlerts(store.getState())).toEqual([]);
    });
  });

  describe('state', () => {
    beforeAll(() => {
      store.dispatch(
        createTopicAction.failure({ alert: failurePayloadWithoutId })
      );
      store.dispatch(
        createTopicAction.failure({ alert: failurePayloadWithId })
      );
    });

    it('returns fetch status', () => {
      const alerts = selectors.getAlerts(store.getState());
      expect(alerts.length).toEqual(2);
    });
  });
});
