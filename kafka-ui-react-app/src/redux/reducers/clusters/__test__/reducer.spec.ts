import { fetchClusterListAction } from 'redux/actions';
import reducer from 'redux/reducers/clusters/reducer';

import { clustersPayload } from './fixtures';

describe('Clusters reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, fetchClusterListAction.request())).toEqual([]);
  });

  it('reacts on GET_CLUSTERS__SUCCESS and returns payload', () => {
    expect(
      reducer(undefined, fetchClusterListAction.success(clustersPayload))
    ).toEqual(clustersPayload);
  });
});
