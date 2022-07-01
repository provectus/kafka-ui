import React from 'react';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { ClusterName, TopicName } from 'redux/interfaces';
import { RouteParamsClusterTopic } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';

import StatisticsLoader from './StatisticsLoader';

export interface Props {
  isFetched: boolean;
  fetchTopicConfig: (payload: {
    clusterName: ClusterName;
    topicName: TopicName;
  }) => void;
}

const Statistics: React.FC<Props> = ({ isFetched, fetchTopicConfig }) => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();

  React.useEffect(() => {
    fetchTopicConfig({ clusterName, topicName });
  }, [fetchTopicConfig, clusterName, topicName]);

  if (!isFetched) {
    return <PageLoader />;
  }

  const onUpdate = () => {};
  const onLoad = () => {};
  return (
    <div>
      <StatisticsLoader
        {...{ onLoad, onUpdate }}
        status="ready"
        updatedTime="kjgdfjkghfjhgfjkhgfjhg"
      />
      <StatisticsLoader
        {...{ onLoad, onUpdate }}
        status="loading"
        onUpdate={onUpdate}
        updatedTime="kjgdfjkghfjhgfjkhgfjhg"
      />
      <StatisticsLoader
        {...{ onLoad, onUpdate }}
        onUpdate={onUpdate}
        updatedTime="kjgdfjkghfjhgfjkhgfjhg"
      />
      Statistics page
    </div>
  );
};

export default Statistics;
