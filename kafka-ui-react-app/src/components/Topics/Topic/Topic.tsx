import React from 'react';
import { Switch, Route, useParams } from 'react-router-dom';
import { ClusterName, TopicName } from 'redux/interfaces';
import EditContainer from 'components/Topics/Topic/Edit/EditContainer';
import DetailsContainer from 'components/Topics/Topic/Details/DetailsContainer';
import PageLoader from 'components/common/PageLoader/PageLoader';
import {
  clusterTopicEditPath,
  clusterTopicPath,
  clusterTopicSendMessagePath,
} from 'lib/paths';

import SendMessage from './SendMessage/SendMessage';

interface RouterParams {
  clusterName: ClusterName;
  topicName: TopicName;
}

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
  const { clusterName, topicName } = useParams<RouterParams>();

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
    <Switch>
      <Route
        exact
        path={clusterTopicEditPath(':clusterName', ':topicName')}
        component={EditContainer}
      />
      <Route
        exact
        path={clusterTopicSendMessagePath(':clusterName', ':topicName')}
        component={SendMessage}
      />
      <Route
        path={clusterTopicPath(':clusterName', ':topicName')}
        component={DetailsContainer}
      />
    </Switch>
  );
};

export default Topic;
