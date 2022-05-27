import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { ClusterName, TopicName } from 'redux/interfaces';
import EditContainer from 'components/Topics/Topic/Edit/EditContainer';
import DetailsContainer from 'components/Topics/Topic/Details/DetailsContainer';
import PageLoader from 'components/common/PageLoader/PageLoader';
import {
  clusterTopicEditPath,
  clusterTopicPath,
  clusterTopicSendMessagePath,
  RouteParamsClusterTopic,
} from 'lib/paths';

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
  const { clusterName, topicName } =
    useParams<RouteParamsClusterTopic>() as RouteParamsClusterTopic;

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
      <Route path={clusterTopicEditPath()} element={<EditContainer />} />
      <Route path={clusterTopicSendMessagePath()} element={<SendMessage />} />
      <Route path={clusterTopicPath()} element={<DetailsContainer />} />
    </Routes>
  );
};

export default Topic;
