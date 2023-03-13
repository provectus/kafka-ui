import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  createSelector,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  ConsumerGroupDetails,
  ConsumerGroupOrdering,
  ConsumerGroupsPageResponse,
  SortOrder,
} from 'generated-sources';
import { AsyncRequestStatus } from 'lib/constants';
import {
  getResponse,
  showServerError,
  showSuccessAlert,
} from 'lib/errorHandling';
import {
  ClusterName,
  ConsumerGroupID,
  ConsumerGroupResetOffsetRequestParams,
  RootState,
} from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';
import { EntityState } from '@reduxjs/toolkit/src/entities/models';
import { consumerGroupsApiClient } from 'lib/api';

export const fetchConsumerGroupsPaged = createAsyncThunk<
  ConsumerGroupsPageResponse,
  {
    clusterName: ClusterName;
    orderBy?: ConsumerGroupOrdering;
    sortOrder?: SortOrder;
    page?: number;
    perPage?: number;
    search: string;
  }
>(
  'consumerGroups/fetchConsumerGroupsPaged',
  async (
    { clusterName, orderBy, sortOrder, page, perPage, search },
    { rejectWithValue }
  ) => {
    try {
      return await consumerGroupsApiClient.getConsumerGroupsPage({
        clusterName,
        orderBy,
        sortOrder,
        page,
        perPage,
        search,
      });
    } catch (error) {
      showServerError(error as Response);
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
      return await consumerGroupsApiClient.getConsumerGroup({
        clusterName,
        id: consumerGroupID,
      });
    } catch (error) {
      showServerError(error as Response);
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
      await consumerGroupsApiClient.deleteConsumerGroup({
        clusterName,
        id: consumerGroupID,
      });
      showSuccessAlert({
        message: `Consumer ${consumerGroupID} group deleted`,
      });
      return consumerGroupID;
    } catch (error) {
      showServerError(error as Response);
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
      await consumerGroupsApiClient.resetConsumerGroupOffsets({
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
      showSuccessAlert({
        message: `Consumer ${consumerGroupID} group offsets reset`,
      });
      return consumerGroupID;
    } catch (error) {
      showServerError(error as Response);
      return rejectWithValue(await getResponse(error as Response));
    }
  }
);
const SCHEMAS_PAGE_COUNT = 1;

const consumerGroupsAdapter = createEntityAdapter<ConsumerGroupDetails>({
  selectId: (consumerGroup) => consumerGroup.groupId,
});

interface ConsumerGroupState extends EntityState<ConsumerGroupDetails> {
  orderBy: ConsumerGroupOrdering | null;
  sortOrder: SortOrder;
  totalPages: number;
}

const initialState: ConsumerGroupState = {
  orderBy: ConsumerGroupOrdering.NAME,
  sortOrder: SortOrder.ASC,
  totalPages: SCHEMAS_PAGE_COUNT,
  ...consumerGroupsAdapter.getInitialState(),
};

const consumerGroupsSlice = createSlice({
  name: 'consumerGroups',
  initialState,
  reducers: {
    sortBy: (state, action: PayloadAction<ConsumerGroupOrdering>) => {
      state.orderBy = action.payload;
      state.sortOrder =
        state.orderBy === action.payload && state.sortOrder === SortOrder.ASC
          ? SortOrder.DESC
          : SortOrder.ASC;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchConsumerGroupsPaged.fulfilled,
      (state, { payload }) => {
        state.totalPages = payload.pageCount || SCHEMAS_PAGE_COUNT;
        consumerGroupsAdapter.setAll(state, payload.consumerGroups || []);
      }
    );
    builder.addCase(fetchConsumerGroupDetails.fulfilled, (state, { payload }) =>
      consumerGroupsAdapter.upsertOne(state, payload)
    );
    builder.addCase(deleteConsumerGroup.fulfilled, (state, { payload }) =>
      consumerGroupsAdapter.removeOne(state, payload)
    );
  },
});

export const { sortBy } = consumerGroupsSlice.actions;

const consumerGroupsState = ({
  consumerGroups,
}: RootState): ConsumerGroupState => consumerGroups;

export const { selectAll, selectById } =
  consumerGroupsAdapter.getSelectors<RootState>(consumerGroupsState);

export const getAreConsumerGroupsPagedFulfilled = createSelector(
  createFetchingSelector('consumerGroups/fetchConsumerGroupsPaged'),
  (status) => status === AsyncRequestStatus.fulfilled
);

export const getAreConsumerGroupDetailsFulfilled = createSelector(
  createFetchingSelector('consumerGroups/fetchConsumerGroupDetails'),
  (status) => status === AsyncRequestStatus.fulfilled
);

export const getIsOffsetReseted = createSelector(
  createFetchingSelector('consumerGroups/resetConsumerGroupOffsets'),
  (status) => status === AsyncRequestStatus.fulfilled
);

export const getConsumerGroupsOrderBy = createSelector(
  consumerGroupsState,
  (state) => state.orderBy
);

export const getConsumerGroupsSortOrder = createSelector(
  consumerGroupsState,
  (state) => state.sortOrder
);

export const getConsumerGroupsTotalPages = createSelector(
  consumerGroupsState,
  (state) => state.totalPages
);

export default consumerGroupsSlice.reducer;
