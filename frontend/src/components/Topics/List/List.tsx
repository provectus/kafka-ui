import React from 'react';
import { TopicWithDetailedInfo, ClusterId } from 'types';
import ListItem from './ListItem';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { NavLink } from 'react-router-dom';
import { clusterTopicNewPath } from 'lib/paths';

interface Props {
  clusterId: ClusterId;
  topics: (TopicWithDetailedInfo)[];
  externalTopics: (TopicWithDetailedInfo)[];
}

const List: React.FC<Props> = ({
  clusterId,
  topics,
  externalTopics,
}) => {
  const [showInternal, setShowInternal] = React.useState<boolean>(true);

  const handleSwitch = () => setShowInternal(!showInternal);

  const items = showInternal ? topics : externalTopics;

  return (
    <div className="section">
      <Breadcrumb>All Topics</Breadcrumb>

      <div className="box">
        <div className="level">
          <div className="level-item level-left">
            <div className="field">
              <input
                id="switchRoundedDefault"
                type="checkbox"
                name="switchRoundedDefault"
                className="switch is-rounded"
                checked={showInternal}
                onChange={handleSwitch}
              />
              <label htmlFor="switchRoundedDefault">
                Show Internal Topics
              </label>
            </div>
          </div>
          <div className="level-item level-right">
            <NavLink
              className="button is-primary"
              to={clusterTopicNewPath(clusterId)}
            >
              Add a Topic
            </NavLink>
          </div>
        </div>
      </div>
      <div className="box">
        <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Topic Name</th>
              <th>Total Partitions</th>
              <th>Out of sync replicas</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {items.map((topic, index) => (
              <ListItem
                key={`topic-list-item-key-${index}`}
                {...topic}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default List;
