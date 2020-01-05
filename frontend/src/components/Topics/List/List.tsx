import React from 'react';
import { Topic } from 'types';
import ListItem from './ListItem';

interface Props {
  topics: Topic[];
}

const List: React.FC<Props> = ({
  topics,
}) => {
  return (
    <>
      <div className="section">
        <div className="box">
          <table className="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>Topic Name</th>
                <th>Total Partitions</th>
                <th>Out of sync replicas</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <ListItem
                  key={topic.name}
                  {...topic}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default List;
