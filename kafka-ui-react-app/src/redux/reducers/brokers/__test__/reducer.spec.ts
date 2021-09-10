import { fetchBrokersAction, fetchClusterStatsAction } from 'redux/actions';
import reducer, { initialState } from 'redux/reducers/brokers/reducer';

import {
  brokersPayload,
  brokerStatsPayload,
  brokersReducerState,
} from './fixtures';

describe('Clusters reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, fetchBrokersAction.request())).toEqual(
      initialState
    );
  });

  it('reacts on GET_BROKERS__SUCCESS and returns payload', () => {
    expect(
      reducer(initialState, fetchBrokersAction.success(brokersPayload))
    ).toEqual({
      ...initialState,
      items: brokersPayload,
    });
  });

  it('reacts on GET_BROKER_METRICS__SUCCESS and returns payload', () => {
    expect(
      reducer(initialState, fetchClusterStatsAction.success(brokerStatsPayload))
    ).toEqual(brokersReducerState);
  });
});
