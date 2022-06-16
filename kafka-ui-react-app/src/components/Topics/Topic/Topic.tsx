import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ClusterName, TopicName } from 'redux/interfaces';
import EditContainer from 'components/Topics/Topic/Edit/EditContainer';
import DetailsContainer from 'components/Topics/Topic/Details/DetailsContainer';
import PageLoader from 'components/common/PageLoader/PageLoader';
import {
  clusterTopicEditRelativePath,
  clusterTopicSendMessageRelativePath,
  RouteParamsClusterTopic,
} from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';

import SendMessage from './SendMessage/SendMessage';

interface TopicProps {
  isTopicFetching: boolean;
  resetTopicMessages: () => void;
  fetchTopicDetails: (payload: {
    clusterName: ClusterName;
    topicName: TopicName;
  }) => void;
}

const Topic: React.FC<TopicProps> = ({
  isTopicFetching,
  fetchTopicDetails,
  resetTopicMessages,
}) => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();

  React.useEffect(() => {
    fetchTopicDetails({ clusterName, topicName });
  }, [fetchTopicDetails, clusterName, topicName]);

  React.useEffect(() => {
    return () => {
      resetTopicMessages();
    };
  }, []);

  if (isTopicFetching) {
    return <PageLoader />;
  }

  return (
    <Routes>
      <Route path="*" element={<DetailsContainer />} />
      <Route path={clusterTopicEditRelativePath} element={<EditContainer />} />
      <Route
        path={clusterTopicSendMessageRelativePath}
        element={<SendMessage />}
      />
    </Routes>
  );
};

export default Topic;
