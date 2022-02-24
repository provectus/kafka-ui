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
  ConsumerGroupsPageResponse,
  GetConsumerGroupsPageRequest,
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

export const fetchAllConsumerGroups = createAsyncThunk<
  ConsumerGroup[],
  ClusterName
>(
  'consumerGroups/fetchConsumerGroups',
  async (clusterName: ClusterName, { rejectWithValue }) => {
    try {
      return await api.getConsumerGroups({
        clusterName,
      });
    } catch (error) {
      return rejectWithValue(await getResponse(error as Response));
    }
  }
);

export const fetchConsumerGroupsPage = createAsyncThunk<
  ConsumerGroupsPageResponse,
  GetConsumerGroupsPageRequest
>(
  'consumerGroups/fetchConsumerGroupsPage',
  async (
    { clusterName, page, perPage, search, orderBy, sortOrder },
    { rejectWithValue }
  ) => {
    try {
      return await api.getConsumerGroupsPage({
        clusterName,
        page,
        perPage,
        search: search || undefined,
        orderBy,
        sortOrder,
      });
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
      return await api.getConsumerGroup({
        clusterName,
        id: consumerGroupID,
      });
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

const CONSUMER_GROUP_PAGE_COUNT = 1;

const initialState = {
  totalPages: CONSUMER_GROUP_PAGE_COUNT,
  ...consumerGroupsAdapter.getInitialState(),
};

const consumerGroupsSlice = createSlice({
  name: 'consumerGroups',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchConsumerGroupsPage.fulfilled, (state, { payload }) => {
      state.totalPages = payload.pageCount || CONSUMER_GROUP_PAGE_COUNT;
      consumerGroupsAdapter.setAll(state, payload.consumerGroups || []);
    });
    builder.addCase(fetchConsumerGroupDetails.fulfilled, (state, { payload }) =>
      consumerGroupsAdapter.upsertOne(state, payload)
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

export const getAreConsumerGroupsPageFulfilled = createSelector(
  createFetchingSelector('consumerGroups/fetchConsumerGroupsPage'),
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
