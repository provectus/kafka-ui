import {
  SchemasApi,
  Configuration,
  NewSchemaSubject,
  SchemaSubject,
} from 'generated-sources';
import {
  PromiseThunkResult,
  ClusterName,
  SchemaName,
  FailurePayload,
} from 'redux/interfaces';

import { BASE_PARAMS } from 'lib/constants';
import * as actions from 'redux/actions';
import { getResponse } from 'lib/errorHandling';

const apiClientConf = new Configuration(BASE_PARAMS);
export const schemasApiClient = new SchemasApi(apiClientConf);

export const fetchSchemasByClusterName = (
  clusterName: ClusterName
): PromiseThunkResult<void> => async (dispatch) => {
  dispatch(actions.fetchSchemasByClusterNameAction.request());
  try {
    const schemas = await schemasApiClient.getSchemas({ clusterName });
    dispatch(actions.fetchSchemasByClusterNameAction.success(schemas));
  } catch (e) {
    dispatch(actions.fetchSchemasByClusterNameAction.failure());
  }
};

export const fetchSchemaVersions = (
  clusterName: ClusterName,
  subject: SchemaName
): PromiseThunkResult<void> => async (dispatch) => {
  if (!subject) return;
  dispatch(actions.fetchSchemaVersionsAction.request());
  try {
    const versions = await schemasApiClient.getAllVersionsBySubject({
      clusterName,
      subject,
    });
    dispatch(actions.fetchSchemaVersionsAction.success(versions));
  } catch (e) {
    dispatch(actions.fetchSchemaVersionsAction.failure());
  }
};

export const createSchema = (
  clusterName: ClusterName,
  newSchemaSubject: NewSchemaSubject
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.createSchemaAction.request());
  try {
    const schema: SchemaSubject = await schemasApiClient.createNewSchema({
      clusterName,
      newSchemaSubject,
    });
    dispatch(actions.createSchemaAction.success(schema));
  } catch (error) {
    const response = await getResponse(error);
    const alert: FailurePayload = {
      subject: 'schema',
      subjectId: newSchemaSubject.subject,
      title: `Schema ${newSchemaSubject.subject}`,
      response,
    };
    dispatch(actions.createSchemaAction.failure({ alert }));
  }
};
