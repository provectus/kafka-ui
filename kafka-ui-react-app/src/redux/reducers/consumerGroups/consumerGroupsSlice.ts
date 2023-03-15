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
  ConsumerGroupResetOffsetRequestParams,
  RootState,
} from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';
import { EntityState } from '@reduxjs/toolkit/src/entities/models';
import { consumerGroupsApiClient } from 'lib/api';
import { ConsumerGroupID } from 'lib/hooks/api/consumers';

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
    builder.addCase(fetchConsumerGroupDetails.fulfilled, (state, { payload }) =>
      consumerGroupsAdapter.upsertOne(state, payload)
    );
  },
});

export const { sortBy } = consumerGroupsSlice.actions;

const consumerGroupsState = ({
  consumerGroups,
}: RootState): ConsumerGroupState => consumerGroups;

export const { selectAll, selectById } =
  consumerGroupsAdapter.getSelectors<RootState>(consumerGroupsState);

export const getAreConsumerGroupDetailsFulfilled = createSelector(
  createFetchingSelector('consumerGroups/fetchConsumerGroupDetails'),
  (status) => status === AsyncRequestStatus.fulfilled
);

export const getIsOffsetReseted = createSelector(
  createFetchingSelector('consumerGroups/resetConsumerGroupOffsets'),
  (status) => status === AsyncRequestStatus.fulfilled
);

export default consumerGroupsSlice.reducer;
