import {
  KafkaConnectApi,
  Configuration,
  NewConnector,
  Connector,
  ConnectorAction,
  TaskId,
} from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';
import {
  ClusterName,
  ConnectName,
  ConnectorConfig,
  ConnectorName,
  ConnectorSearch,
  FailurePayload,
  PromiseThunkResult,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import { getResponse } from 'lib/errorHandling';
import { batch } from 'react-redux';

const apiClientConf = new Configuration(BASE_PARAMS);
export const kafkaConnectApiClient = new KafkaConnectApi(apiClientConf);
export const fetchConnects =
  (clusterName: ClusterName): PromiseThunkResult<void> =>
  async (dispatch) => {
    dispatch(actions.fetchConnectsAction.request());
    try {
      const connects = await kafkaConnectApiClient.getConnects({ clusterName });
      dispatch(actions.fetchConnectsAction.success({ connects }));
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
  (
    clusterName: ClusterName,
    search = '',
    silent = false
  ): PromiseThunkResult<void> =>
  async (dispatch) => {
    if (!silent) dispatch(actions.fetchConnectorsAction.request());
    try {
      const connectors = await kafkaConnectApiClient.getAllConnectors({
        clusterName,
        search,
      });
      dispatch(actions.fetchConnectorsAction.success({ connectors }));
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

export const fetchConnector =
  (
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName
  ): PromiseThunkResult<void> =>
  async (dispatch) => {
    dispatch(actions.fetchConnectorAction.request());
    try {
      const connector = await kafkaConnectApiClient.getConnector({
        clusterName,
        connectName,
        connectorName,
      });
      dispatch(actions.fetchConnectorAction.success({ connector }));
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: [clusterName, connectName, connectorName].join('-'),
        title: `Kafka Connect Connector`,
        response,
      };
      dispatch(actions.fetchConnectorAction.failure({ alert }));
    }
  };

export const createConnector =
  (
    clusterName: ClusterName,
    connectName: ConnectName,
    newConnector: NewConnector
  ): PromiseThunkResult<Connector | undefined> =>
  async (dispatch) => {
    dispatch(actions.createConnectorAction.request());
    try {
      const connector = await kafkaConnectApiClient.createConnector({
        clusterName,
        connectName,
        newConnector,
      });
      dispatch(actions.createConnectorAction.success({ connector }));
      return connector;
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: [clusterName, connectName].join('-'),
        title: `Kafka Connect Connector Create`,
        response,
      };
      dispatch(actions.createConnectorAction.failure({ alert }));
    }
    return undefined;
  };

export const deleteConnector =
  (
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName
  ): PromiseThunkResult<void> =>
  async (dispatch) => {
    dispatch(actions.deleteConnectorAction.request());
    try {
      await kafkaConnectApiClient.deleteConnector({
        clusterName,
        connectName,
        connectorName,
      });
      dispatch(actions.deleteConnectorAction.success({ connectorName }));
      dispatch(fetchConnectors(clusterName, '', true));
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: [clusterName, connectName, connectorName].join('-'),
        title: `Kafka Connect Connector Delete`,
        response,
      };
      dispatch(actions.deleteConnectorAction.failure({ alert }));
      throw error;
    }
  };

export const fetchConnectorTasks =
  (
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName,
    silent = false
  ): PromiseThunkResult<void> =>
  async (dispatch) => {
    if (!silent) dispatch(actions.fetchConnectorTasksAction.request());
    try {
      const tasks = await kafkaConnectApiClient.getConnectorTasks({
        clusterName,
        connectName,
        connectorName,
      });
      dispatch(actions.fetchConnectorTasksAction.success({ tasks }));
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: [clusterName, connectName, connectorName].join('-'),
        title: `Kafka Connect Connector Tasks`,
        response,
      };
      dispatch(actions.fetchConnectorTasksAction.failure({ alert }));
    }
  };

export const restartConnector =
  (
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName
  ): PromiseThunkResult<void> =>
  async (dispatch) => {
    dispatch(actions.restartConnectorAction.request());
    try {
      await kafkaConnectApiClient.updateConnectorState({
        clusterName,
        connectName,
        connectorName,
        action: ConnectorAction.RESTART,
      });
      dispatch(actions.restartConnectorAction.success());
      dispatch(
        fetchConnectorTasks(clusterName, connectName, connectorName, true)
      );
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: [clusterName, connectName, connectorName].join('-'),
        title: `Kafka Connect Connector Restart`,
        response,
      };
      dispatch(actions.restartConnectorAction.failure({ alert }));
    }
  };

export const restartTasks =
  (
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName,
    action: ConnectorAction
  ): PromiseThunkResult<void> =>
  async (dispatch) => {
    dispatch(actions.restartTasksAction.request());
    try {
      await kafkaConnectApiClient.updateConnectorState({
        clusterName,
        connectName,
        connectorName,
        action,
      });
      batch(() => {
        dispatch(actions.restartTasksAction.success());
        dispatch(
          fetchConnectorTasks(clusterName, connectName, connectorName, true)
        );
      });
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: [clusterName, connectName, connectorName].join('-'),
        title: `Kafka Connect Connector Tasks Restart`,
        response,
      };
      dispatch(actions.restartTasksAction.failure({ alert }));
    }
  };

export const pauseConnector =
  (
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName
  ): PromiseThunkResult<void> =>
  async (dispatch) => {
    dispatch(actions.pauseConnectorAction.request());
    try {
      await kafkaConnectApiClient.updateConnectorState({
        clusterName,
        connectName,
        connectorName,
        action: ConnectorAction.PAUSE,
      });
      dispatch(actions.pauseConnectorAction.success({ connectorName }));
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: [clusterName, connectName, connectorName].join('-'),
        title: `Kafka Connect Connector Pause`,
        response,
      };
      dispatch(actions.pauseConnectorAction.failure({ alert }));
    }
  };

export const resumeConnector =
  (
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName
  ): PromiseThunkResult<void> =>
  async (dispatch) => {
    dispatch(actions.resumeConnectorAction.request());
    try {
      await kafkaConnectApiClient.updateConnectorState({
        clusterName,
        connectName,
        connectorName,
        action: ConnectorAction.RESUME,
      });
      dispatch(actions.resumeConnectorAction.success({ connectorName }));
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: [clusterName, connectName, connectorName].join('-'),
        title: `Kafka Connect Connector Resume`,
        response,
      };
      dispatch(actions.resumeConnectorAction.failure({ alert }));
    }
  };

export const restartConnectorTask =
  (
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName,
    taskId: TaskId['task']
  ): PromiseThunkResult<void> =>
  async (dispatch) => {
    dispatch(actions.restartConnectorTaskAction.request());
    try {
      await kafkaConnectApiClient.restartConnectorTask({
        clusterName,
        connectName,
        connectorName,
        taskId: Number(taskId),
      });
      dispatch(actions.restartConnectorTaskAction.success());
      dispatch(
        fetchConnectorTasks(clusterName, connectName, connectorName, true)
      );
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: [clusterName, connectName, connectorName, taskId].join('-'),
        title: `Kafka Connect Connector Task Restart`,
        response,
      };
      dispatch(actions.restartConnectorTaskAction.failure({ alert }));
    }
  };

export const fetchConnectorConfig =
  (
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName,
    silent = false
  ): PromiseThunkResult<void> =>
  async (dispatch) => {
    if (!silent) dispatch(actions.fetchConnectorConfigAction.request());
    try {
      const config = await kafkaConnectApiClient.getConnectorConfig({
        clusterName,
        connectName,
        connectorName,
      });
      dispatch(actions.fetchConnectorConfigAction.success({ config }));
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: [clusterName, connectName, connectorName].join('-'),
        title: `Kafka Connect Connector Config`,
        response,
      };
      dispatch(actions.fetchConnectorConfigAction.failure({ alert }));
    }
  };

export const updateConnectorConfig =
  (
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName,
    connectorConfig: ConnectorConfig
  ): PromiseThunkResult<Connector | undefined> =>
  async (dispatch) => {
    dispatch(actions.updateConnectorConfigAction.request());
    try {
      const connector = await kafkaConnectApiClient.setConnectorConfig({
        clusterName,
        connectName,
        connectorName,
        requestBody: connectorConfig,
      });
      dispatch(actions.updateConnectorConfigAction.success({ connector }));
      return connector;
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: [clusterName, connectName, connectorName].join('-'),
        title: `Kafka Connect Connector Config Update`,
        response,
      };
      dispatch(actions.updateConnectorConfigAction.failure({ alert }));
    }
    return undefined;
  };

export const setConnectorSearch = (
  connectorSearch: ConnectorSearch,
  silent = false
): PromiseThunkResult<void> => {
  return fetchConnectors(
    connectorSearch.clusterName,
    connectorSearch.search,
    silent
  );
};
