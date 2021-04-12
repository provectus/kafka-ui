import { TopicConfig } from 'generated-sources';
import React from 'react';
import { ClusterName, TopicName } from 'redux/interfaces';

interface Props {
  clusterName: ClusterName;
  topicName: TopicName;
  config?: TopicConfig[];
  isFetched: boolean;
  fetchTopicConfig: (clusterName: ClusterName, topicName: TopicName) => void;
}

interface ListItemProps {
  config: TopicConfig;
}

const ConfigListItem: React.FC<ListItemProps> = ({
  config: { name, value, defaultValue },
}) => {
  const hasCustomValue = value !== defaultValue;

  return (
    <tr>
      <td className={hasCustomValue ? 'has-text-weight-bold' : ''}>{name}</td>
      <td className={hasCustomValue ? 'has-text-weight-bold' : ''}>{value}</td>
      <td className="has-text-grey" title="Default Value">
        {hasCustomValue && defaultValue}
      </td>
    </tr>
  );
};

const Settings: React.FC<Props> = ({
  clusterName,
  topicName,
  isFetched,
  fetchTopicConfig,
  config,
}) => {
  React.useEffect(() => {
    fetchTopicConfig(clusterName, topicName);
  }, [fetchTopicConfig, clusterName, topicName]);

  if (!isFetched || !config) {
    return null;
  }

  return (
    <div className="box">
      <div className="table-container">
        <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Default Value</th>
            </tr>
          </thead>
          <tbody>
            {config.map((item) => (
              <ConfigListItem key={item.name} config={item} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;
