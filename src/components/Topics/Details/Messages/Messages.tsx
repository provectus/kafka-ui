import React from 'react';
import { ClusterId, TopicName } from 'lib/interfaces';

interface Props {
  clusterId: ClusterId;
  topicName: TopicName;
}

const Messages: React.FC<Props> = ({
  clusterId,
  topicName,
}) => {
  return (
    <h1>
      Messages from {clusterId}{topicName}
    </h1>
  );
}

export default Messages;
