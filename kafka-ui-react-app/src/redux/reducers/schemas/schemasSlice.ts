import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { Configuration, SchemasApi, SchemaSubject } from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';
import { getResponse } from 'lib/errorHandling';
import { ClusterName, RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const apiClientConf = new Configuration(BASE_PARAMS);
export const schemasApiClient = new SchemasApi(apiClientConf);

export const fetchSchemas = createAsyncThunk<SchemaSubject[], ClusterName>(
  'schemas/fetch',
  async (clusterName: ClusterName, { rejectWithValue }) => {
    try {
      return await schemasApiClient.getSchemas({ clusterName });
    } catch (error) {
      return rejectWithValue(await getResponse(error as Response));
    }
  }
);
export const fetchSchemaVersions = createAsyncThunk<
  SchemaSubject[],
  { clusterName: ClusterName; subject: SchemaSubject['subject'] }
>(
  'schemas/versions/fetch',
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

const schemasSlice = createSlice({
  name: 'schemas',
  initialState: schemasAdapter.getInitialState({
    versions: schemaVersionsAdapter.getInitialState(),
  }),
  reducers: {
    schemaAdded: schemasAdapter.addOne,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSchemas.fulfilled, (state, { payload }) => {
      schemasAdapter.setAll(state, payload);
    });
    builder.addCase(fetchSchemaVersions.fulfilled, (state, { payload }) => {
      schemaVersionsAdapter.setAll(state.versions, payload);
    });
  },
});

export const { selectAll: selectAllSchemas, selectById: selectSchemaById } =
  schemasAdapter.getSelectors<RootState>((state) => state.schemas);

export const { selectAll: selectAllSchemaVersions } =
  schemaVersionsAdapter.getSelectors<RootState>(
    (state) => state.schemas.versions
  );

export const { schemaAdded } = schemasSlice.actions;

export const getAreSchemasFulfilled = createSelector(
  createFetchingSelector('schemas/fetch'),
  (status) => status === 'fulfilled'
);
export const getAreSchemaVersionsFulfilled = createSelector(
  createFetchingSelector('schemas/versions/fetch'),
  (status) => status === 'fulfilled'
);

export default schemasSlice.reducer;
