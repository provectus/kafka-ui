import React from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import TableRenderer from 'components/KsqlDb/Query/renderer/TableRenderer/TableRenderer';
import { ClusterNameRoute } from 'lib/paths';
import {
  useExecuteKsqlkDbQueryMutation,
  useKsqlkDbSSE,
} from 'lib/hooks/api/ksqlDb';

import type { FormValues } from './QueryForm/QueryForm';
import QueryForm from './QueryForm/QueryForm';

const Query = () => {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const executeQuery = useExecuteKsqlkDbQueryMutation();
  const [pipeId, setPipeId] = React.useState<string | false>(false);

  const sse = useKsqlkDbSSE({ clusterName, pipeId });

  const isFetching = executeQuery.isLoading || sse.isFetching;

  const submitHandler = async (values: FormValues) => {
    const filtered = values.streamsProperties.filter(({ key }) => key != null);
    const streamsProperties = filtered.reduce<Record<string, string>>(
      (acc, current) => ({ ...acc, [current.key]: current.value }),
      {}
    );
    await executeQuery.mutateAsync(
      {
        clusterName,
        ksqlCommandV2: {
          ...values,
          streamsProperties:
            values.streamsProperties[0].key !== ''
              ? JSON.parse(JSON.stringify(streamsProperties))
              : undefined,
        },
      },
      { onSuccess: (data) => setPipeId(data.pipeId) }
    );
  };

  return (
    <>
      <QueryForm
        fetching={isFetching}
        hasResults={!!sse.data && !!pipeId}
        resetResults={() => setPipeId(false)}
        submitHandler={submitHandler}
      />
      {pipeId && !!sse.data && <TableRenderer table={sse.data} />}
    </>
  );
};

export default Query;
