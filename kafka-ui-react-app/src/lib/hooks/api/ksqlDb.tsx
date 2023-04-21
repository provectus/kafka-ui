import { ksqlDbApiClient as api } from 'lib/api';
import { useMutation, useQueries } from '@tanstack/react-query';
import { ClusterName } from 'redux/interfaces';
import { BASE_PARAMS } from 'lib/constants';
import React from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import {
  showAlert,
  showServerError,
  showSuccessAlert,
} from 'lib/errorHandling';
import {
  ExecuteKsqlRequest,
  KsqlResponse,
  KsqlTableResponse,
} from 'generated-sources';
import { StopLoading } from 'components/Topics/Topic/Messages/Messages.styled';
import toast from 'react-hot-toast';

export function useKsqlkDb(clusterName: ClusterName) {
  return useQueries({
    queries: [
      {
        queryKey: ['clusters', clusterName, 'ksqlDb', 'tables'],
        queryFn: () => api.listTables({ clusterName }),
        suspense: false,
      },
      {
        queryKey: ['clusters', clusterName, 'ksqlDb', 'streams'],
        queryFn: () => api.listStreams({ clusterName }),
        suspense: false,
      },
    ],
  });
}

export function useExecuteKsqlkDbQueryMutation() {
  return useMutation((props: ExecuteKsqlRequest) => api.executeKsql(props));
}

const getFormattedErrorFromTableData = (
  responseValues: KsqlTableResponse['values']
): { title: string; message: string } => {
  // We expect someting like that
  // [[
  //   "@type",
  //   "error_code",
  //   "message",
  //   "statementText"?,
  //   "entities"?
  // ]],
  // or
  // [["message"]]

  if (!responseValues || !responseValues.length) {
    return {
      title: 'Unknown error',
      message: 'Recieved empty response',
    };
  }

  let title = '';
  let message = '';
  if (responseValues[0].length < 2) {
    const [messageText] = responseValues[0];
    title = messageText;
  } else {
    const [type, errorCode, messageText, statementText, entities] =
      responseValues[0];
    title = `[Error #${errorCode}] ${type}`;
    message =
      (entities?.length ? `[${entities.join(', ')}] ` : '') +
      (statementText ? `"${statementText}" ` : '') +
      messageText;
  }

  return { title, message };
};

type UseKsqlkDbSSEProps = {
  pipeId: string | false;
  clusterName: ClusterName;
};

export const useKsqlkDbSSE = ({ clusterName, pipeId }: UseKsqlkDbSSEProps) => {
  const [data, setData] = React.useState<KsqlTableResponse>();
  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  const abortController = new AbortController();

  React.useEffect(() => {
    const fetchData = async () => {
      const url = `${BASE_PARAMS.basePath}/api/clusters/${encodeURIComponent(
        clusterName
      )}/ksql/response`;
      await fetchEventSource(
        `${url}?${new URLSearchParams({ pipeId: pipeId || '' }).toString()}`,
        {
          method: 'GET',
          signal: abortController.signal,
          openWhenHidden: true,
          async onopen(response) {
            const { ok, status } = response;
            if (ok) setData(undefined); // Reset
            if (status >= 400 && status < 500 && status !== 429) {
              showServerError(response);
            }
          },
          onmessage(event) {
            const { table }: KsqlResponse = JSON.parse(event.data);
            if (!table) {
              return;
            }
            switch (table?.header) {
              case 'Execution error': {
                showAlert('error', {
                  ...getFormattedErrorFromTableData(table.values),
                  id: `${url}-executionError`,
                });
                break;
              }
              case 'Schema':
                setData(table);
                break;
              case 'Row':
                setData((state) => ({
                  header: state?.header,
                  columnNames: state?.columnNames,
                  values: [...(state?.values || []), ...(table?.values || [])],
                }));
                break;
              case 'Query Result':
                showSuccessAlert({
                  id: `${url}-querySuccess`,
                  title: 'Query succeed',
                  message: '',
                });
                break;
              case 'Source Description':
              case 'properties':
              default:
                setData(table);
                break;
            }
          },
          onclose() {
            setIsFetching(false);
          },
          onerror(err) {
            setIsFetching(false);
            showServerError(err);
          },
        }
      );
    };

    const abortFetchData = () => {
      setIsFetching(false);
      if (pipeId) abortController.abort();
    };
    if (pipeId) {
      toast.promise(
        fetchData(),
        {
          loading: (
            <>
              <div>Consuming query execution result...</div>
              &nbsp;
              <StopLoading onClick={abortFetchData}>Abort</StopLoading>
            </>
          ),
          success: 'Cancelled',
          error: 'Something went wrong. Please try again.',
        },
        {
          id: 'messages',
          success: { duration: 20 },
        }
      );
    }

    return abortFetchData;
  }, [pipeId]);

  return { data, isFetching };
};
