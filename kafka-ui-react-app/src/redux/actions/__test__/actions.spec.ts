import {
  clusterSchemasPayload,
  schemaVersionsPayload,
} from 'redux/reducers/schemas/__test__/fixtures';
import * as actions from '../actions';

describe('Actions', () => {
  describe('fetchClusterStatsAction', () => {
    it('creates an REQUEST action', () => {
      expect(actions.fetchClusterStatsAction.request()).toEqual({
        type: 'GET_CLUSTER_STATUS__REQUEST',
      });
    });

    it('creates an SUCCESS action', () => {
      expect(
        actions.fetchClusterStatsAction.success({ brokerCount: 1 })
      ).toEqual({
        type: 'GET_CLUSTER_STATUS__SUCCESS',
        payload: {
          brokerCount: 1,
        },
      });
    });

    it('creates an FAILURE action', () => {
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
});
