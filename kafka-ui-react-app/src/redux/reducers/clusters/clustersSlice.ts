import {
  createAsyncThunk,
  createSlice,
  createSelector,
} from '@reduxjs/toolkit';
import {
  ClustersApi,
  Configuration,
  Cluster,
  ServerStatus,
  ClusterFeaturesEnum,
} from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';
import { RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const apiClientConf = new Configuration(BASE_PARAMS);
export const clustersApiClient = new ClustersApi(apiClientConf);

export const fetchClusters = createAsyncThunk(
  'clusters/fetchClusters',
  async () => {
    const clusters: Cluster[] = await clustersApiClient.getClusters();
    return clusters;
  }
);

export const initialState: Cluster[] = [];
export const clustersSlice = createSlice({
  name: 'clusters',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchClusters.fulfilled, (_, { payload }) => payload);
  },
});

const clustersState = ({ clusters }: RootState): Cluster[] => clusters;
const getClusterListFetchingStatus = createFetchingSelector(
  'clusters/fetchClusters'
);
export const getAreClustersFulfilled = createSelector(
  getClusterListFetchingStatus,
  (status) => status === 'fulfilled'
);
export const getClusterList = createSelector(
  clustersState,
  (clusters) => clusters
);
export const getOnlineClusters = createSelector(getClusterList, (clusters) =>
  clusters.filter(({ status }) => status === ServerStatus.ONLINE)
);
export const getOfflineClusters = createSelector(getClusterList, (clusters) =>
  clusters.filter(({ status }) => status === ServerStatus.OFFLINE)
);
export const getClustersReadonlyStatus = (clusterName: string) =>
  createSelector(
    getClusterList,
    (clusters): boolean =>
      clusters.find(({ name }) => name === clusterName)?.readOnly || false
  );
export const getClustersFeatures = (clusterName: string) =>
  createSelector(
    getClusterList,
    (clusters): ClusterFeaturesEnum[] =>
      clusters.find(({ name }) => name === clusterName)?.features || []
  );

export default clustersSlice.reducer;
