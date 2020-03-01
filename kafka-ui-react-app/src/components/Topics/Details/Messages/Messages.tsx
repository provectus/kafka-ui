import React from 'react';
import { ClusterName, TopicName } from 'redux/interfaces';

interface Props {
  clusterName: ClusterName;
  topicName: TopicName;
}

const Messages: React.FC<Props> = ({
  clusterName,
  topicName,
}) => {
  return (
    <h1>
      Messages from {clusterName}{topicName}
    </h1>
  );
};

export default Messages;
