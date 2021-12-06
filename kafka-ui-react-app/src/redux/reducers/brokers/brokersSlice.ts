import { BrokersApi, ClustersApi, Configuration } from 'generated-sources';
import { BrokersState, ClusterName, ZooKeeperStatus } from 'redux/interfaces';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
export const brokersApiClient = new BrokersApi(apiClientConf);
export const clustersApiClient = new ClustersApi(apiClientConf);

export const fetchBrokers = createAsyncThunk(
  'brokers/fetchBrokers',
  async (clusterName: ClusterName) => {
    const response = await brokersApiClient.getBrokers({ clusterName });
    return response;
  }
);

export const fetchClusterStats = createAsyncThunk(
  'brokers/fetchClusterStats',
  async (clusterName: ClusterName) => {
    const response = await clustersApiClient.getClusterStats({ clusterName });
    return response;
  }
);

export const initialState: BrokersState = {
  items: [],
  brokerCount: 0,
  zooKeeperStatus: ZooKeeperStatus.offline,
  activeControllers: 0,
  onlinePartitionCount: 0,
  offlinePartitionCount: 0,
  inSyncReplicasCount: 0,
  outOfSyncReplicasCount: 0,
  underReplicatedPartitionCount: 0,
  diskUsage: [],
};

export const brokersSlice = createSlice({
  name: 'brokers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBrokers.pending, () => initialState);
    builder.addCase(fetchBrokers.fulfilled, (state, { payload }) => ({
      ...state,
      items: payload,
    }));
    builder.addCase(fetchClusterStats.fulfilled, (state, { payload }) => ({
      ...state,
      ...payload,
    }));
  },
});

export default brokersSlice.reducer;
