import fetchMock from 'fetch-mock-jest';
import * as actions from 'redux/actions/actions';
import * as thunks from 'redux/actions/thunks';
import * as schemaFixtures from 'redux/reducers/schemas/__test__/fixtures';
import {
  CompatibilityLevelCompatibilityEnum,
  SchemaType,
} from 'generated-sources';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';
import * as fixtures from 'redux/actions/__test__/fixtures';

const store = mockStoreCreator;

const clusterName = 'local';
const subject = 'test';

describe('Thunks', () => {
  afterEach(() => {
    fetchMock.restore();
    store.clearActions();
  });

  describe('fetchSchemasByClusterName', () => {
    it('creates GET_CLUSTER_SCHEMAS__SUCCESS when fetching cluster schemas', async () => {
      fetchMock.getOnce(`/api/clusters/${clusterName}/schemas`, {
        body: schemaFixtures.clusterSchemasPayload,
      });
      await store.dispatch(thunks.fetchSchemasByClusterName(clusterName));
      expect(store.getActions()).toEqual([
        actions.fetchSchemasByClusterNameAction.request(),
        actions.fetchSchemasByClusterNameAction.success(
          schemaFixtures.clusterSchemasPayload
        ),
      ]);
    });

    it('creates GET_CLUSTER_SCHEMAS__FAILURE when fetching cluster schemas', async () => {
      fetchMock.getOnce(`/api/clusters/${clusterName}/schemas`, 404);
      await store.dispatch(thunks.fetchSchemasByClusterName(clusterName));
      expect(store.getActions()).toEqual([
        actions.fetchSchemasByClusterNameAction.request(),
        actions.fetchSchemasByClusterNameAction.failure(),
      ]);
    });
  });

  describe('fetchSchemaVersions', () => {
    it('creates GET_SCHEMA_VERSIONS__SUCCESS when fetching schema versions', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/schemas/${subject}/versions`,
        {
          body: schemaFixtures.schemaVersionsPayload,
        }
      );
      await store.dispatch(thunks.fetchSchemaVersions(clusterName, subject));
      expect(store.getActions()).toEqual([
        actions.fetchSchemaVersionsAction.request(),
        actions.fetchSchemaVersionsAction.success(
          schemaFixtures.schemaVersionsPayload
        ),
      ]);
    });

    it('creates GET_SCHEMA_VERSIONS__FAILURE when fetching schema versions', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/schemas/${subject}/versions`,
        404
      );
      await store.dispatch(thunks.fetchSchemaVersions(clusterName, subject));
      expect(store.getActions()).toEqual([
        actions.fetchSchemaVersionsAction.request(),
        actions.fetchSchemaVersionsAction.failure(),
      ]);
    });
  });

  describe('createSchema', () => {
    it('creates POST_SCHEMA__SUCCESS when posting new schema', async () => {
      fetchMock.postOnce(`/api/clusters/${clusterName}/schemas`, {
        body: schemaFixtures.schemaVersionsPayload[0],
      });
      await store.dispatch(
        thunks.createSchema(clusterName, fixtures.schemaPayload)
      );
      expect(store.getActions()).toEqual([
        actions.createSchemaAction.request(),
        actions.createSchemaAction.success(
          schemaFixtures.schemaVersionsPayload[0]
        ),
      ]);
    });

    it('creates POST_SCHEMA__FAILURE when posting new schema', async () => {
      fetchMock.postOnce(`/api/clusters/${clusterName}/schemas`, 404);
      try {
        await store.dispatch(
          thunks.createSchema(clusterName, fixtures.schemaPayload)
        );
      } catch (error) {
        expect(store.getActions()).toEqual([
          actions.createSchemaAction.request(),
          actions.createSchemaAction.failure({
            alert: {
              response: {
                status: 404,
                statusText: 'Not Found',
                url: `/api/clusters/${clusterName}/schemas`,
              },
              subject: 'schema-NewSchema',
              title: 'Schema NewSchema',
            },
          }),
        ]);
      }
    });
  });

  describe('deleteSchema', () => {
    it('fires DELETE_SCHEMA__SUCCESS on success', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/schemas/${subject}`,
        200
      );

      await store.dispatch(thunks.deleteSchema(clusterName, subject));

      expect(store.getActions()).toEqual([
        actions.deleteSchemaAction.request(),
        actions.deleteSchemaAction.success(subject),
      ]);
    });

    it('fires DELETE_SCHEMA__FAILURE on failure', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/schemas/${subject}`,
        404
      );

      try {
        await store.dispatch(thunks.deleteSchema(clusterName, subject));
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.deleteSchemaAction.request(),
          actions.deleteSchemaAction.failure({}),
        ]);
      }
    });
  });

  describe('updateSchema', () => {
    it('calls PATCH_SCHEMA__REQUEST', () => {
      store.dispatch(
        thunks.updateSchema(
          fixtures.schema,
          fixtures.schemaPayload.schema,
          SchemaType.AVRO,
          CompatibilityLevelCompatibilityEnum.BACKWARD,
          clusterName,
          subject
        )
      );
      expect(store.getActions()).toEqual([
        actions.updateSchemaAction.request(),
      ]);
    });
  });

  describe('fetchGlobalSchemaCompatibilityLevel', () => {
    it('calls GET_GLOBAL_SCHEMA_COMPATIBILITY__REQUEST on the fucntion call', () => {
      store.dispatch(thunks.fetchGlobalSchemaCompatibilityLevel(clusterName));
      expect(store.getActions()).toEqual([
        actions.fetchGlobalSchemaCompatibilityLevelAction.request(),
      ]);
    });

    it('calls GET_GLOBAL_SCHEMA_COMPATIBILITY__SUCCESS on a successful API call', async () => {
      fetchMock.getOnce(`/api/clusters/${clusterName}/schemas/compatibility`, {
        compatibility: CompatibilityLevelCompatibilityEnum.FORWARD,
      });
      await store.dispatch(
        thunks.fetchGlobalSchemaCompatibilityLevel(clusterName)
      );
      expect(store.getActions()).toEqual([
        actions.fetchGlobalSchemaCompatibilityLevelAction.request(),
        actions.fetchGlobalSchemaCompatibilityLevelAction.success(
          CompatibilityLevelCompatibilityEnum.FORWARD
        ),
      ]);
    });

    it('calls GET_GLOBAL_SCHEMA_COMPATIBILITY__FAILURE on an unsuccessful API call', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/schemas/compatibility`,
        404
      );
      try {
        await store.dispatch(
          thunks.fetchGlobalSchemaCompatibilityLevel(clusterName)
        );
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.fetchGlobalSchemaCompatibilityLevelAction.request(),
          actions.fetchGlobalSchemaCompatibilityLevelAction.failure(),
        ]);
      }
    });
  });

  describe('updateGlobalSchemaCompatibilityLevel', () => {
    const compatibilityLevel = CompatibilityLevelCompatibilityEnum.FORWARD;
    it('calls POST_GLOBAL_SCHEMA_COMPATIBILITY__REQUEST on the fucntion call', () => {
      store.dispatch(
        thunks.updateGlobalSchemaCompatibilityLevel(
          clusterName,
          compatibilityLevel
        )
      );
      expect(store.getActions()).toEqual([
        actions.updateGlobalSchemaCompatibilityLevelAction.request(),
      ]);
    });

    it('calls POST_GLOBAL_SCHEMA_COMPATIBILITY__SUCCESS on a successful API call', async () => {
      fetchMock.putOnce(
        `/api/clusters/${clusterName}/schemas/compatibility`,
        200
      );
      await store.dispatch(
        thunks.updateGlobalSchemaCompatibilityLevel(
          clusterName,
          compatibilityLevel
        )
      );
      expect(store.getActions()).toEqual([
        actions.updateGlobalSchemaCompatibilityLevelAction.request(),
        actions.updateGlobalSchemaCompatibilityLevelAction.success(
          CompatibilityLevelCompatibilityEnum.FORWARD
        ),
      ]);
    });

    it('calls POST_GLOBAL_SCHEMA_COMPATIBILITY__FAILURE on an unsuccessful API call', async () => {
      fetchMock.putOnce(
        `/api/clusters/${clusterName}/schemas/compatibility`,
        404
      );
      try {
        await store.dispatch(
          thunks.updateGlobalSchemaCompatibilityLevel(
            clusterName,
            compatibilityLevel
          )
        );
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.updateGlobalSchemaCompatibilityLevelAction.request(),
          actions.updateGlobalSchemaCompatibilityLevelAction.failure(),
        ]);
      }
    });
  });
});
