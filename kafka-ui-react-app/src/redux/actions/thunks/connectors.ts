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

export const fetchConnects =
  (clusterName: ClusterName): PromiseThunkResult<void> =>
  async (dispatch, getState) => {
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

export const fetchConnectors =
  (clusterName: ClusterName, silent = false): PromiseThunkResult<void> =>
  async (dispatch, getState) => {
    if (!silent) dispatch(actions.fetchConnectorsAction.request());
    try {
      const connectors = await kafkaConnectApiClient.getAllConnectors({
        clusterName,
      });
      const state = getState().connect;
      dispatch(actions.fetchConnectorsAction.success({ ...state, connectors }));
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: [clusterName, 'connectors'].join('-'),
        title: `Kafka Connect Connectors`,
        response,
      };
      dispatch(actions.fetchConnectorsAction.failure({ alert }));
    }
  };

export const deleteConnector =
  (
    clusterName: ClusterName,
    connectName: string,
    connectorName: string
  ): PromiseThunkResult<void> =>
  async (dispatch, getState) => {
    dispatch(actions.deleteConnectorAction.request());
    try {
      await kafkaConnectApiClient.deleteConnector({
        clusterName,
        connectName,
        connectorName,
      });
      const state = getState().connect;
      dispatch(
        actions.deleteConnectorAction.success({
          ...state,
          connectors: state?.connectors.filter(
            ({ name }) => name !== connectorName
          ),
        })
      );
      dispatch(fetchConnectors(clusterName, true));
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: [clusterName, connectName, connectorName].join('-'),
        title: `Kafka Connect Connector Delete`,
        response,
      };
      dispatch(actions.deleteConnectorAction.failure({ alert }));
    }
  };
