import { KafkaConnectApi, Configuration } from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';

import {
  ClusterName,
  FailurePayload,
  PromiseThunkResult,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import { getResponse } from 'lib/errorHandling';

const apiClientConf = new Configuration(BASE_PARAMS);
export const kafkaConnectApiClient = new KafkaConnectApi(apiClientConf);

export const fetchConnects = (
  clusterName: ClusterName
): PromiseThunkResult<void> => async (dispatch, getState) => {
  dispatch(actions.fetchConnectsAction.request());
  try {
    const connects = await kafkaConnectApiClient.getConnects({ clusterName });
    const state = getState().connect;
    dispatch(actions.fetchConnectsAction.success({ ...state, connects }));
  } catch (error) {
    const response = await getResponse(error);
    const alert: FailurePayload = {
      subject: 'connects',
      title: `Kafka Connect`,
      response,
    };
    dispatch(actions.fetchConnectsAction.failure({ alert }));
  }
};

export const fetchConnectors = (
  clusterName: ClusterName,
  connectName: string
): PromiseThunkResult<void> => async (dispatch, getState) => {
  dispatch(actions.fetchConnectorsAction.request());
  try {
    const connectorNames = await kafkaConnectApiClient.getConnectors({
      clusterName,
      connectName,
    });
    const connectors = await Promise.all(
      connectorNames.map((connectorName) =>
        kafkaConnectApiClient.getConnector({
          clusterName,
          connectName,
          connectorName,
        })
      )
    );
    const state = getState().connect;
    dispatch(actions.fetchConnectorsAction.success({ ...state, connectors }));
  } catch (error) {
    const response = await getResponse(error);
    const alert: FailurePayload = {
      subject: ['connect', connectName, 'connectors'].join('-'),
      title: `Kafka Connect ${connectName}. Connectors`,
      response,
    };
    dispatch(actions.fetchConnectorsAction.failure({ alert }));
  }
};

export const fetchConnector = (
  clusterName: ClusterName,
  connectName: string,
  connectorName: string
): PromiseThunkResult<void> => async (dispatch, getState) => {
  dispatch(actions.fetchConnectorAction.request());
  try {
    const connector = await kafkaConnectApiClient.getConnector({
      clusterName,
      connectName,
      connectorName,
    });
    const state = getState().connect;
    const newState = {
      ...state,
      connectors: [...state.connectors, connector],
    };

    dispatch(actions.fetchConnectorAction.success(newState));
  } catch (error) {
    const response = await getResponse(error);
    const alert: FailurePayload = {
      subject: ['connect', connectName, 'connectors', connectorName].join('-'),
      title: `Kafka Connect ${connectName}. Connector ${connectorName}`,
      response,
    };
    dispatch(actions.fetchConnectorAction.failure({ alert }));
  }
};
