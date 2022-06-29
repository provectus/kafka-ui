import React from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterBrokerParam } from 'lib/paths';
import useBrokersMetrics from 'lib/hooks/useBrokersMetrics';
import { SchemaType } from 'generated-sources';
import EditorViewer from 'components/common/EditorViewer/EditorViewer';

const BrokerMetrics: React.FC = () => {
  const { clusterName, brokerId } = useAppParams<ClusterBrokerParam>();
  const { data: metrics } = useBrokersMetrics(clusterName, Number(brokerId));

  return (
    <EditorViewer
      schemaType={SchemaType.JSON}
      data={metrics ? JSON.stringify(metrics) : 'Metrics data not available'}
    />
  );
};

export default BrokerMetrics;
