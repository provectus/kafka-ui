import React from 'react';
import { ClusterName, TopicName } from 'redux/interfaces';
import { TopicConfig } from 'generated-sources';

interface Props {
  clusterName: ClusterName;
  topicName: TopicName;
  config?: TopicConfig[];
  isFetched: boolean;
  fetchTopicConfig: (clusterName: ClusterName, topicName: TopicName) => void;
}

const ConfigListItem: React.FC<TopicConfig> = ({
  name,
  value,
  defaultValue,
}) => {
  const hasCustomValue = value !== defaultValue;

  return (
    <tr>
      <td className={hasCustomValue ? 'has-text-weight-bold' : ''}>
        {name}
      </td>
      <td className={hasCustomValue ? 'has-text-weight-bold' : ''}>
        {value}
      </td>
      <td
        className="has-text-grey"
        title="Default Value"
      >
        {hasCustomValue && defaultValue}
      </td>
    </tr>
  )
};

const Sertings: React.FC<Props> = ({
  clusterName,
  topicName,
  isFetched,
  fetchTopicConfig,
  config,
}) => {
  React.useEffect(
    () => { fetchTopicConfig(clusterName, topicName); },
    [fetchTopicConfig, clusterName, topicName],
  );

  if (!isFetched || !config) {
    return null;
  }

  return (
    <div className="box">
      <table className="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
            <th>Default Value</th>
          </tr>
        </thead>
        <tbody>
          {config.map((item, index) => <ConfigListItem key={`config-list-item-key-${index}`} {...item} />)}
        </tbody>
      </table>
    </div>
  );
};

export default Sertings;
