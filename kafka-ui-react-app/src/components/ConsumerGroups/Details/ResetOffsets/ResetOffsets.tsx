import React from 'react';
import { clusterConsumerGroupsPath, ClusterGroupParam } from 'lib/paths';
import 'react-datepicker/dist/react-datepicker.css';
import PageHeading from 'components/common/PageHeading/PageHeading';
import useAppParams from 'lib/hooks/useAppParams';
import { useConsumerGroupDetails } from 'lib/hooks/api/consumers';
import PageLoader from 'components/common/PageLoader/PageLoader';
import {
  ConsumerGroupOffsetsReset,
  ConsumerGroupOffsetsResetType,
} from 'generated-sources';

import Form from './Form';

const ResetOffsets: React.FC = () => {
  const routerParams = useAppParams<ClusterGroupParam>();

  const { consumerGroupID } = routerParams;
  const consumerGroup = useConsumerGroupDetails(routerParams);

  if (consumerGroup.isLoading || !consumerGroup.isSuccess)
    return <PageLoader />;

  const partitions = consumerGroup.data.partitions || [];
  const { topic } = partitions[0] || '';

  const uniqTopics = Array.from(
    new Set(partitions.map((partition) => partition.topic))
  );

  const defaultValues: ConsumerGroupOffsetsReset = {
    resetType: ConsumerGroupOffsetsResetType.EARLIEST,
    topic,
    partitionsOffsets: [],
    resetToTimestamp: new Date().getTime(),
  };

  return (
    <>
      <PageHeading
        text={consumerGroupID}
        backTo={clusterConsumerGroupsPath(routerParams.clusterName)}
        backText="Consumers"
      />
      <Form
        defaultValues={defaultValues}
        topics={uniqTopics}
        partitions={partitions}
      />
    </>
  );
};

export default ResetOffsets;
