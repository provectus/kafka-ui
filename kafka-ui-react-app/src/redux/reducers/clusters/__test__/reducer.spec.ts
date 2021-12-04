import reducer, { fetchClusters } from 'redux/reducers/clusters/clustersSlice';

import { clustersPayload } from './fixtures';

describe('Clusters reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, { type: fetchClusters.pending })).toEqual([]);
  });

  it('reacts on GET_CLUSTERS__SUCCESS and returns payload', () => {
    expect(
      reducer([], {
        type: fetchClusters.fulfilled,
        payload: clustersPayload,
      })
    ).toEqual(clustersPayload);
  });
});
