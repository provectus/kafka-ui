import {
  createSchemaAction,
  fetchSchemasByClusterNameAction,
  fetchSchemaVersionsAction,
} from 'redux/actions';
import configureStore from 'redux/store/configureStore';
import * as selectors from 'redux/reducers/schemas/selectors';
import {
  clusterSchemasPayload,
  clusterSchemasPayloadWithNewSchema,
  newSchemaPayload,
  schemaVersionsPayload,
} from './fixtures';

const store = configureStore();

describe('Schemas selectors', () => {
  describe('Initial state', () => {
    it('returns fetch status', () => {
      expect(selectors.getIsSchemaListFetched(store.getState())).toBeFalsy();
      expect(selectors.getIsSchemaVersionFetched(store.getState())).toBeFalsy();
      expect(selectors.getSchemaCreated(store.getState())).toBeFalsy();
    });

    it('returns schema list', () => {
      expect(selectors.getSchemaList(store.getState())).toEqual([]);
    });

    it('returns undefined schema', () => {
      expect(selectors.getSchema(store.getState(), ' ')).toBeUndefined();
    });

    it('returns sorted versions of schema', () => {
      expect(selectors.getSortedSchemaVersions(store.getState())).toEqual([]);
    });
  });

  describe('state', () => {
    beforeAll(() => {
      store.dispatch(
        fetchSchemasByClusterNameAction.success(clusterSchemasPayload)
      );
      store.dispatch(fetchSchemaVersionsAction.success(schemaVersionsPayload));
      store.dispatch(createSchemaAction.success(newSchemaPayload));
    });

    it('returns fetch status', () => {
      expect(selectors.getIsSchemaListFetched(store.getState())).toBeTruthy();
      expect(
        selectors.getIsSchemaVersionFetched(store.getState())
      ).toBeTruthy();
      expect(selectors.getSchemaCreated(store.getState())).toBeTruthy();
    });

    it('returns schema list', () => {
      expect(selectors.getSchemaList(store.getState())).toEqual(
        clusterSchemasPayloadWithNewSchema
      );
    });

    it('returns schema', () => {
      expect(selectors.getSchema(store.getState(), 'test2')).toEqual(
        clusterSchemasPayload[0]
      );
    });

    it('returns sorted versions of schema', () => {
      expect(selectors.getSortedSchemaVersions(store.getState())).toEqual(
        schemaVersionsPayload
      );
    });
  });
});
