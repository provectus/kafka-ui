import {
  fetchConnectorsAction,
  fetchConnectorAction,
  fetchConnectsAction,
} from 'redux/actions';
import reducer, { initialState } from 'redux/reducers/connect/reducer';

describe('Clusters reducer', () => {
  it('reacts on GET_CONNECTS__SUCCESS and returns payload', () => {
    expect(
      reducer(undefined, fetchConnectsAction.success(initialState))
    ).toEqual(initialState);
  });
  it('reacts on GET_CONNECTORS__SUCCESS and returns payload', () => {
    expect(
      reducer(undefined, fetchConnectorsAction.success(initialState))
    ).toEqual(initialState);
  });
  it('reacts on GET_CONNECTOR__SUCCESS and returns payload', () => {
    expect(
      reducer(undefined, fetchConnectorAction.success(initialState))
    ).toEqual(initialState);
  });
});
