import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  createSelector,
} from '@reduxjs/toolkit';
import {
  Configuration,
  ConsumerGroup,
  ConsumerGroupDetails,
  ConsumerGroupsApi,
} from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';
import { getResponse } from 'lib/errorHandling';
import {
  ClusterName,
  ConsumerGroupID,
  ConsumerGroupResetOffsetRequestParams,
  RootState,
} from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const apiClientConf = new Configuration(BASE_PARAMS);
export const api = new ConsumerGroupsApi(apiClientConf);

export const fetchConsumerGroups = createAsyncThunk<
  ConsumerGroup[],
  ClusterName
>(
  'consumerGroups/fetchConsumerGroups',
  async (clusterName: ClusterName, { rejectWithValue }) => {
    try {
      const response = await api.getConsumerGroups({
        clusterName,
      });
      return response;
    } catch (error) {
      return rejectWithValue(await getResponse(error as Response));
    }
  }
);

export const fetchConsumerGroupDetails = createAsyncThunk<
  ConsumerGroupDetails,
  { clusterName: ClusterName; consumerGroupID: ConsumerGroupID }
>(
  'consumerGroups/fetchConsumerGroupDetails',
  async ({ clusterName, consumerGroupID }, { rejectWithValue }) => {
    try {
      const response = await api.getConsumerGroup({
        clusterName,
        id: consumerGroupID,
      });
      return response;
    } catch (error) {
      return rejectWithValue(await getResponse(error as Response));
    }
  }
);

export const deleteConsumerGroup = createAsyncThunk<
  ConsumerGroupID,
  { clusterName: ClusterName; consumerGroupID: ConsumerGroupID }
>(
  'consumerGroups/deleteConsumerGroup',
  async ({ clusterName, consumerGroupID }, { rejectWithValue }) => {
    try {
      await api.deleteConsumerGroup({
        clusterName,
        id: consumerGroupID,
      });

      return consumerGroupID;
    } catch (error) {
      return rejectWithValue(await getResponse(error as Response));
    }
  }
);

export const resetConsumerGroupOffsets = createAsyncThunk<
  ConsumerGroupID,
  ConsumerGroupResetOffsetRequestParams
>(
  'consumerGroups/resetConsumerGroupOffsets',
  async (
    { clusterName, consumerGroupID, requestBody },
    { rejectWithValue }
  ) => {
    try {
      await api.resetConsumerGroupOffsets({
        clusterName,
        id: consumerGroupID,
        consumerGroupOffsetsReset: {
          topic: requestBody.topic,
          resetType: requestBody.resetType,
          partitions: requestBody.partitions,
          partitionsOffsets: requestBody.partitionsOffsets?.map((offset) => ({
            ...offset,
            offset: +offset.offset,
          })),
          resetToTimestamp: requestBody.resetToTimestamp?.getTime(),
        },
      });
      return consumerGroupID;
    } catch (error) {
      return rejectWithValue(await getResponse(error as Response));
    }
  }
);

const consumerGroupsAdapter = createEntityAdapter<ConsumerGroupDetails>({
  selectId: (consumerGroup) => consumerGroup.groupId,
});

const consumerGroupsSlice = createSlice({
  name: 'consumerGroups',
  initialState: consumerGroupsAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchConsumerGroups.fulfilled, (state, { payload }) =>
      consumerGroupsAdapter.setAll(state, payload)
    );
    builder.addCase(fetchConsumerGroupDetails.fulfilled, (state, { payload }) =>
      consumerGroupsAdapter.updateOne(state, {
        id: payload.groupId,
        changes: payload,
      })
    );
    builder.addCase(deleteConsumerGroup.fulfilled, (state, { payload }) =>
      consumerGroupsAdapter.removeOne(state, payload)
    );
  },
});

export const { selectAll, selectById } =
  consumerGroupsAdapter.getSelectors<RootState>(
    ({ consumerGroups }) => consumerGroups
  );

export const getAreConsumerGroupsFulfilled = createSelector(
  createFetchingSelector('consumerGroups/fetchConsumerGroups'),
  (status) => status === 'fulfilled'
);

export const getIsConsumerGroupDeleted = createSelector(
  createFetchingSelector('consumerGroups/deleteConsumerGroup'),
  (status) => status === 'fulfilled'
);

export const getAreConsumerGroupDetailsFulfilled = createSelector(
  createFetchingSelector('consumerGroups/fetchConsumerGroupDetails'),
  (status) => status === 'fulfilled'
);

export const getIsOffsetReseted = createSelector(
  createFetchingSelector('consumerGroups/resetConsumerGroupOffsets'),
  (status) => status === 'fulfilled'
);

export default consumerGroupsSlice.reducer;
