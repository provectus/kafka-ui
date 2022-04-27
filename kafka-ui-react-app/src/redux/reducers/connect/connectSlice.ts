import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  Configuration,
  Connect,
  Connector,
  ConnectorAction,
  ConnectorState,
  ConnectorTaskStatus,
  FullConnectorInfo,
  KafkaConnectApi,
  NewConnector,
  Task,
  TaskId,
} from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';
import { getResponse } from 'lib/errorHandling';
import {
  ClusterName,
  ConnectName,
  ConnectorConfig,
  ConnectorName,
  ConnectorSearch,
  ConnectState,
} from 'redux/interfaces';

const apiClientConf = new Configuration(BASE_PARAMS);
export const kafkaConnectApiClient = new KafkaConnectApi(apiClientConf);

export const fetchConnects = createAsyncThunk<
  { connects: Connect[] },
  ClusterName
>('connect/fetchConnects', async (clusterName, { rejectWithValue }) => {
  try {
    const connects = await kafkaConnectApiClient.getConnects({ clusterName });

    return { connects };
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
});

export const fetchConnectors = createAsyncThunk<
  { connectors: FullConnectorInfo[] },
  { clusterName: ClusterName; search?: string }
>(
  'connect/fetchConnectors',
  async ({ clusterName, search = '' }, { rejectWithValue }) => {
    try {
      const connectors = await kafkaConnectApiClient.getAllConnectors({
        clusterName,
        search,
      });

      return { connectors };
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const fetchConnector = createAsyncThunk<
  { connector: Connector },
  {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }
>(
  'connect/fetchConnector',
  async ({ clusterName, connectName, connectorName }, { rejectWithValue }) => {
    try {
      const connector = await kafkaConnectApiClient.getConnector({
        clusterName,
        connectName,
        connectorName,
      });

      return { connector };
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const createConnector = createAsyncThunk<
  { connector: Connector },
  {
    clusterName: ClusterName;
    connectName: ConnectName;
    newConnector: NewConnector;
  }
>(
  'connect/createConnector',
  async ({ clusterName, connectName, newConnector }, { rejectWithValue }) => {
    try {
      const connector = await kafkaConnectApiClient.createConnector({
        clusterName,
        connectName,
        newConnector,
      });

      return { connector };
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const deleteConnector = createAsyncThunk<
  { connectorName: string },
  {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }
>(
  'connect/deleteConnector',
  async (
    { clusterName, connectName, connectorName },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await kafkaConnectApiClient.deleteConnector({
        clusterName,
        connectName,
        connectorName,
      });

      dispatch(fetchConnectors({ clusterName, search: '' }));

      return { connectorName };
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const fetchConnectorTasks = createAsyncThunk<
  { tasks: Task[] },
  {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }
>(
  'connect/fetchConnectorTasks',
  async ({ clusterName, connectName, connectorName }, { rejectWithValue }) => {
    try {
      const tasks = await kafkaConnectApiClient.getConnectorTasks({
        clusterName,
        connectName,
        connectorName,
      });

      return { tasks };
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const restartConnector = createAsyncThunk<
  undefined,
  {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }
>(
  'connect/restartConnector',
  async (
    { clusterName, connectName, connectorName },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await kafkaConnectApiClient.updateConnectorState({
        clusterName,
        connectName,
        connectorName,
        action: ConnectorAction.RESTART,
      });

      dispatch(
        fetchConnectorTasks({
          clusterName,
          connectName,
          connectorName,
        })
      );

      return undefined;
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const restartTasks = createAsyncThunk<
  undefined,
  {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
    action: ConnectorAction;
  }
>(
  'connect/restartTasks',
  async (
    { clusterName, connectName, connectorName, action },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await kafkaConnectApiClient.updateConnectorState({
        clusterName,
        connectName,
        connectorName,
        action,
      });

      dispatch(
        fetchConnectorTasks({
          clusterName,
          connectName,
          connectorName,
        })
      );

      return undefined;
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const restartConnectorTask = createAsyncThunk<
  undefined,
  {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
    taskId: TaskId['task'];
  }
>(
  'connect/restartConnectorTask',
  async (
    { clusterName, connectName, connectorName, taskId },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await kafkaConnectApiClient.restartConnectorTask({
        clusterName,
        connectName,
        connectorName,
        taskId: Number(taskId),
      });

      dispatch(
        fetchConnectorTasks({
          clusterName,
          connectName,
          connectorName,
        })
      );

      return undefined;
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const fetchConnectorConfig = createAsyncThunk<
  { config: { [key: string]: unknown } },
  {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }
>(
  'connect/fetchConnectorConfig',
  async ({ clusterName, connectName, connectorName }, { rejectWithValue }) => {
    try {
      const config = await kafkaConnectApiClient.getConnectorConfig({
        clusterName,
        connectName,
        connectorName,
      });

      return { config };
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const updateConnectorConfig = createAsyncThunk<
  { connector: Connector },
  {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
    connectorConfig: ConnectorConfig;
  }
>(
  'connect/updateConnectorConfig',
  async (
    { clusterName, connectName, connectorName, connectorConfig },
    { rejectWithValue }
  ) => {
    try {
      const connector = await kafkaConnectApiClient.setConnectorConfig({
        clusterName,
        connectName,
        connectorName,
        requestBody: connectorConfig,
      });

      return { connector };
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const initialState: ConnectState = {
  connects: [],
  connectors: [],
  currentConnector: {
    connector: null,
    tasks: [],
    config: null,
  },
  search: '',
};

const connectSlice = createSlice({
  name: 'connect',
  initialState,
  reducers: {
    setConnectorStatusState: (state, { payload }) => {
      const { connector, tasks } = state.currentConnector;

      if (connector) {
        connector.status.state = payload.connectorState;
      }

      state.currentConnector.tasks = tasks.map((task) => ({
        ...task,
        status: {
          ...task.status,
          state: payload.taskState,
        },
      }));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchConnects.fulfilled, (state, { payload }) => {
      state.connects = payload.connects;
    });
    builder.addCase(fetchConnectors.fulfilled, (state, { payload }) => {
      state.connectors = payload.connectors;
    });
    builder.addCase(fetchConnector.fulfilled, (state, { payload }) => {
      state.currentConnector.connector = payload.connector;
    });
    builder.addCase(createConnector.fulfilled, (state, { payload }) => {
      state.currentConnector.connector = payload.connector;
    });
    builder.addCase(deleteConnector.fulfilled, (state, { payload }) => {
      state.connectors = state.connectors.filter(
        ({ name }) => name !== payload.connectorName
      );
    });
    builder.addCase(fetchConnectorTasks.fulfilled, (state, { payload }) => {
      state.currentConnector.tasks = payload.tasks;
    });
    builder.addCase(fetchConnectorConfig.fulfilled, (state, { payload }) => {
      state.currentConnector.config = payload.config;
    });
    builder.addCase(updateConnectorConfig.fulfilled, (state, { payload }) => {
      state.currentConnector.connector = payload.connector;
      state.currentConnector.config = payload.connector.config;
    });
  },
});

export const { setConnectorStatusState } = connectSlice.actions;

export const pauseCurrentConnector = () =>
  setConnectorStatusState({
    connectorState: ConnectorState.PAUSED,
    taskState: ConnectorTaskStatus.PAUSED,
  });

export const resumeCurrentConnector = () =>
  setConnectorStatusState({
    connectorState: ConnectorState.RUNNING,
    taskState: ConnectorTaskStatus.RUNNING,
  });

export const pauseConnector = createAsyncThunk<
  undefined,
  {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }
>(
  'connect/pauseConnector',
  async (
    { clusterName, connectName, connectorName },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await kafkaConnectApiClient.updateConnectorState({
        clusterName,
        connectName,
        connectorName,
        action: ConnectorAction.PAUSE,
      });

      dispatch(pauseCurrentConnector());

      return undefined;
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const resumeConnector = createAsyncThunk<
  undefined,
  {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }
>(
  'connect/resumeConnector',
  async (
    { clusterName, connectName, connectorName },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await kafkaConnectApiClient.updateConnectorState({
        clusterName,
        connectName,
        connectorName,
        action: ConnectorAction.RESUME,
      });

      dispatch(resumeCurrentConnector());

      return undefined;
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const setConnectorSearch = (connectorSearch: ConnectorSearch) => {
  return fetchConnectors({
    clusterName: connectorSearch.clusterName,
    search: connectorSearch.search,
  });
};

export default connectSlice.reducer;
