import {
  clusterSchemasPayload,
  schemaVersionsPayload,
} from 'redux/reducers/schemas/__test__/fixtures';
import * as actions from '../actions';

describe('Actions', () => {
  describe('fetchClusterStatsAction', () => {
    it('creates a REQUEST action', () => {
      expect(actions.fetchClusterStatsAction.request()).toEqual({
        type: 'GET_CLUSTER_STATUS__REQUEST',
      });
    });

    it('creates a SUCCESS action', () => {
      expect(
        actions.fetchClusterStatsAction.success({ brokerCount: 1 })
      ).toEqual({
        type: 'GET_CLUSTER_STATUS__SUCCESS',
        payload: {
          brokerCount: 1,
        },
      });
    });

    it('creates a FAILURE action', () => {
      expect(actions.fetchClusterStatsAction.failure()).toEqual({
        type: 'GET_CLUSTER_STATUS__FAILURE',
      });
    });
  });

  describe('fetchSchemasByClusterNameAction', () => {
    it('creates a REQUEST action', () => {
      expect(actions.fetchSchemasByClusterNameAction.request()).toEqual({
        type: 'GET_CLUSTER_SCHEMAS__REQUEST',
      });
    });

    it('creates a SUCCESS action', () => {
      expect(
        actions.fetchSchemasByClusterNameAction.success(clusterSchemasPayload)
      ).toEqual({
        type: 'GET_CLUSTER_SCHEMAS__SUCCESS',
        payload: clusterSchemasPayload,
      });
    });

    it('creates a FAILURE action', () => {
      expect(actions.fetchSchemasByClusterNameAction.failure()).toEqual({
        type: 'GET_CLUSTER_SCHEMAS__FAILURE',
      });
    });
  });

  describe('fetchSchemaVersionsAction', () => {
    it('creates a REQUEST action', () => {
      expect(actions.fetchSchemaVersionsAction.request()).toEqual({
        type: 'GET_SCHEMA_VERSIONS__REQUEST',
      });
    });

    it('creates a SUCCESS action', () => {
      expect(
        actions.fetchSchemaVersionsAction.success(schemaVersionsPayload)
      ).toEqual({
        type: 'GET_SCHEMA_VERSIONS__SUCCESS',
        payload: schemaVersionsPayload,
      });
    });

    it('creates a FAILURE action', () => {
      expect(actions.fetchSchemaVersionsAction.failure()).toEqual({
        type: 'GET_SCHEMA_VERSIONS__FAILURE',
      });
    });
  });

  describe('createSchemaAction', () => {
    it('creates a REQUEST action', () => {
      expect(actions.createSchemaAction.request()).toEqual({
        type: 'POST_SCHEMA__REQUEST',
      });
    });

    it('creates a SUCCESS action', () => {
      expect(
        actions.createSchemaAction.success(schemaVersionsPayload[0])
      ).toEqual({
        type: 'POST_SCHEMA__SUCCESS',
        payload: schemaVersionsPayload[0],
      });
    });

    it('creates a FAILURE action', () => {
      expect(actions.createSchemaAction.failure()).toEqual({
        type: 'POST_SCHEMA__FAILURE',
      });
    });
  });
});
