import React from 'react';
import { TopicWithDetailedInfo, ClusterName } from 'redux/interfaces';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { NavLink } from 'react-router-dom';
import { clusterTopicNewPath } from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import ListItem from './ListItem';

interface Props {
  clusterName: ClusterName;
  topics: TopicWithDetailedInfo[];
  externalTopics: TopicWithDetailedInfo[];
}

const List: React.FC<Props> = ({ clusterName, topics, externalTopics }) => {
  const [showInternal, setShowInternal] = React.useState<boolean>(true);

  const handleSwitch = () => setShowInternal(!showInternal);
  const { isReadOnly } = React.useContext(ClusterContext);
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
              <label htmlFor="switchRoundedDefault">Show Internal Topics</label>
            </div>
          </div>
          <div className="level-item level-right">
            {!isReadOnly && (
              <NavLink
                className="button is-primary"
                to={clusterTopicNewPath(clusterName)}
              >
                Add a Topic
              </NavLink>
            )}
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
            {items.map((topic) => (
              <ListItem key={topic.id} topic={topic} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;
