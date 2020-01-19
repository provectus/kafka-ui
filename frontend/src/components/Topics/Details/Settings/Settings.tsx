import React from 'react';
import { ClusterId, TopicName, TopicConfig } from 'lib/interfaces';

interface Props {
  clusterId: ClusterId;
  topicName: TopicName;
  config?: TopicConfig[];
  isFetched: boolean;
  fetchTopicConfig: (clusterId: ClusterId, topicName: TopicName) => void;
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
}

const Sertings: React.FC<Props> = ({
  clusterId,
  topicName,
  isFetched,
  fetchTopicConfig,
  config,
}) => {
  React.useEffect(
    () => { fetchTopicConfig(clusterId, topicName); },
    [fetchTopicConfig, clusterId, topicName],
  );

  if (!isFetched || !config) {
    return (null);
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
}

export default Sertings;
