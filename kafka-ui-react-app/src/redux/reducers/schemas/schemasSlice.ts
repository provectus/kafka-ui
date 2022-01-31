import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import {
  Configuration,
  SchemasApi,
  SchemaSubject,
  SchemaSubjectsResponse,
  GetSchemasRequest,
  GetLatestSchemaRequest,
} from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';
import { getResponse } from 'lib/errorHandling';
import { ClusterName, RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const apiClientConf = new Configuration(BASE_PARAMS);
export const schemasApiClient = new SchemasApi(apiClientConf);

export const SCHEMA_LATEST_FETCH_ACTION = 'schemas/latest/fetch';
export const fetchLatestSchema = createAsyncThunk<
  SchemaSubject,
  GetLatestSchemaRequest
>(SCHEMA_LATEST_FETCH_ACTION, async (schemaParams, { rejectWithValue }) => {
  try {
    return await schemasApiClient.getLatestSchema(schemaParams);
  } catch (error) {
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

export const { selectAll: selectAllSchemas, selectById: selectSchemaById } =
  schemasAdapter.getSelectors<RootState>((state) => state.schemas);

export const {
  selectAll: selectAllSchemaVersions,
  selectById: selectVersionSchemaByID,
} = schemaVersionsAdapter.getSelectors<RootState>(
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
  (status) => status === 'fulfilled'
);

export const getAreSchemaLatestFulfilled = createSelector(
  createFetchingSelector(SCHEMA_LATEST_FETCH_ACTION),
  (status) => status === 'fulfilled'
);
export const getAreSchemaVersionsFulfilled = createSelector(
  createFetchingSelector(SCHEMAS_VERSIONS_FETCH_ACTION),
  (status) => status === 'fulfilled'
);

export default schemasSlice.reducer;
