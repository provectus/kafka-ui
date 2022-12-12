import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import {
  SchemaSubject,
  SchemaSubjectsResponse,
  GetSchemasRequest,
  GetLatestSchemaRequest,
} from 'generated-sources';
import { schemasApiClient } from 'lib/api';
import { AsyncRequestStatus } from 'lib/constants';
import { getResponse, showServerError } from 'lib/errorHandling';
import { ClusterName, RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

export const SCHEMA_LATEST_FETCH_ACTION = 'schemas/latest/fetch';
export const fetchLatestSchema = createAsyncThunk<
  SchemaSubject,
  GetLatestSchemaRequest
>(SCHEMA_LATEST_FETCH_ACTION, async (schemaParams, { rejectWithValue }) => {
  try {
    return await schemasApiClient.getLatestSchema(schemaParams);
  } catch (error) {
    showServerError(error as Response);
    return rejectWithValue(await getResponse(error as Response));
  }
});

export const SCHEMAS_FETCH_ACTION = 'schemas/fetch';
export const fetchSchemas = createAsyncThunk<
  SchemaSubjectsResponse,
  GetSchemasRequest
>(
  SCHEMAS_FETCH_ACTION,
  async ({ clusterName, page, perPage, search }, { rejectWithValue }) => {
    try {
      return await schemasApiClient.getSchemas({
        clusterName,
        page,
        perPage,
        search: search || undefined,
      });
    } catch (error) {
      showServerError(error as Response);
      return rejectWithValue(await getResponse(error as Response));
    }
  }
);

export const SCHEMAS_VERSIONS_FETCH_ACTION = 'schemas/versions/fetch';
export const fetchSchemaVersions = createAsyncThunk<
  SchemaSubject[],
  { clusterName: ClusterName; subject: SchemaSubject['subject'] }
>(
  SCHEMAS_VERSIONS_FETCH_ACTION,
  async ({ clusterName, subject }, { rejectWithValue }) => {
    try {
      return await schemasApiClient.getAllVersionsBySubject({
        clusterName,
        subject,
      });
    } catch (error) {
      showServerError(error as Response);
      return rejectWithValue(await getResponse(error as Response));
    }
  }
);

const schemaVersionsAdapter = createEntityAdapter<SchemaSubject>({
  selectId: ({ id }) => id,
  sortComparer: (a, b) => b.id - a.id,
});
const schemasAdapter = createEntityAdapter<SchemaSubject>({
  selectId: ({ subject }) => subject,
});

const SCHEMAS_PAGE_COUNT = 1;

const initialState = {
  totalPages: SCHEMAS_PAGE_COUNT,
  ...schemasAdapter.getInitialState(),
  versions: {
    ...schemaVersionsAdapter.getInitialState(),
    latest: <SchemaSubject | null>null,
  },
};

const schemasSlice = createSlice({
  name: 'schemas',
  initialState,
  reducers: {
    schemaAdded: schemasAdapter.addOne,
    schemaUpdated: schemasAdapter.upsertOne,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSchemas.fulfilled, (state, { payload }) => {
      state.totalPages = payload.pageCount || SCHEMAS_PAGE_COUNT;
      schemasAdapter.setAll(state, payload.schemas || []);
    });
    builder.addCase(fetchLatestSchema.fulfilled, (state, { payload }) => {
      state.versions.latest = payload;
    });
    builder.addCase(fetchSchemaVersions.fulfilled, (state, { payload }) => {
      schemaVersionsAdapter.setAll(state.versions, payload);
    });
  },
});

export const { selectAll: selectAllSchemas } =
  schemasAdapter.getSelectors<RootState>((state) => state.schemas);

export const { selectAll: selectAllSchemaVersions } =
  schemaVersionsAdapter.getSelectors<RootState>(
    (state) => state.schemas.versions
  );

const getSchemaVersions = (state: RootState) => state.schemas.versions;
export const getSchemaLatest = createSelector(
  getSchemaVersions,
  (state) => state.latest
);

export const { schemaAdded, schemaUpdated } = schemasSlice.actions;

export const getAreSchemasFulfilled = createSelector(
  createFetchingSelector(SCHEMAS_FETCH_ACTION),
  (status) => status === AsyncRequestStatus.fulfilled
);

export const getAreSchemaLatestFulfilled = createSelector(
  createFetchingSelector(SCHEMA_LATEST_FETCH_ACTION),
  (status) => status === AsyncRequestStatus.fulfilled
);
export const getAreSchemaLatestRejected = createSelector(
  createFetchingSelector(SCHEMA_LATEST_FETCH_ACTION),
  (status) => status === AsyncRequestStatus.rejected
);

export const getAreSchemaVersionsFulfilled = createSelector(
  createFetchingSelector(SCHEMAS_VERSIONS_FETCH_ACTION),
  (status) => status === AsyncRequestStatus.fulfilled
);

export default schemasSlice.reducer;
