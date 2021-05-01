import {
  SchemasApi,
  Configuration,
  NewSchemaSubject,
  SchemaSubject,
  CompatibilityLevelCompatibilityEnum,
  SchemaType,
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
import { isEqual } from 'lodash';

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
      subject: ['schema', newSchemaSubject.subject].join('-'),
      title: `Schema ${newSchemaSubject.subject}`,
      response,
    };
    dispatch(actions.createSchemaAction.failure({ alert }));
    throw error;
  }
};

export const updateSchema = (
  latestSchema: SchemaSubject,
  newSchema: string,
  newSchemaType: SchemaType,
  newCompatibilityLevel: CompatibilityLevelCompatibilityEnum,
  clusterName: string,
  subject: string
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.updateSchemaAction.request());
  try {
    let schema: SchemaSubject = latestSchema;
    if (
      (newSchema &&
        !isEqual(JSON.parse(latestSchema.schema), JSON.parse(newSchema))) ||
      newSchemaType !== latestSchema.schemaType
    ) {
      schema = await schemasApiClient.createNewSchema({
        clusterName,
        newSchemaSubject: {
          ...latestSchema,
          schema: newSchema || latestSchema.schema,
          schemaType: newSchemaType || latestSchema.schemaType,
        },
      });
    }
    if (newCompatibilityLevel !== latestSchema.compatibilityLevel) {
      await schemasApiClient.updateSchemaCompatibilityLevel({
        clusterName,
        subject,
        compatibilityLevel: {
          compatibility: newCompatibilityLevel,
        },
      });
    }
    actions.updateSchemaAction.success(schema);
  } catch (e) {
    const response = await getResponse(e);
    const alert: FailurePayload = {
      subject: ['schema', subject].join('-'),
      title: `Schema ${subject}`,
      response,
    };
    dispatch(actions.updateSchemaAction.failure({ alert }));
    throw e;
  }
};
export const deleteSchema = (
  clusterName: ClusterName,
  subject: string
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.deleteSchemaAction.request());
  try {
    await schemasApiClient.deleteSchema({
      clusterName,
      subject,
    });
    dispatch(actions.deleteSchemaAction.success(subject));
  } catch (error) {
    const response = await getResponse(error);
    const alert: FailurePayload = {
      subject: ['schema', subject].join('-'),
      title: `Schema ${subject}`,
      response,
    };
    dispatch(actions.deleteSchemaAction.failure({ alert }));
  }
};
