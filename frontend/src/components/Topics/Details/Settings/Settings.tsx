import React from 'react';
import { ClusterId, TopicName } from 'types';

interface Props {
  clusterId: ClusterId;
  topicName: TopicName;
}

const Sertings: React.FC<Props> = ({
  clusterId,
  topicName,
}) => {
  return (
    <h1>
      Settings {clusterId}/{topicName}
    </h1>
  );
}

export default Sertings;
