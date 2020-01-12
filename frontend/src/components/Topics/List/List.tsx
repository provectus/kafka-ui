import React from 'react';
import { TopicWithDetailedInfo } from 'types';
import ListItem from './ListItem';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';

interface Props {
  topics: (TopicWithDetailedInfo)[];
  externalTopics: (TopicWithDetailedInfo)[];
}

const List: React.FC<Props> = ({
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
