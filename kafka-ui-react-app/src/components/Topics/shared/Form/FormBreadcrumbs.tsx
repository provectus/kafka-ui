import React from 'react';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { clusterTopicsPath, clusterTopicPath } from 'lib/paths';
import { ClusterName, TopicName } from 'redux/interfaces';

interface Props {
  clusterName: ClusterName;
  topicName?: TopicName;
  current: string;
}

const FormBreadcrumbs: React.FC<Props> = ({
  clusterName,
  topicName,
  current,
}) => {
  const allTopicsLink = {
    href: clusterTopicsPath(clusterName),
    label: 'All Topics',
  };
  const links = topicName
    ? [
        allTopicsLink,
        { href: clusterTopicPath(clusterName, topicName), label: topicName },
      ]
    : [allTopicsLink];

  return (
    <div className="level-item level-left">
      <Breadcrumb links={links}>{current}</Breadcrumb>
    </div>
  );
};

export default FormBreadcrumbs;
