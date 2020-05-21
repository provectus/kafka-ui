import React from 'react';
import { ClusterName, ConsumerGroup } from 'redux/interfaces';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import ListItem from './ListItem';

interface Props {
  clusterName: ClusterName;
  consumerGroups: ConsumerGroup[];
}

const List: React.FC<Props> = ({ consumerGroups }) => {
  const [searchText, setSearchText] = React.useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  return (
    <div className="section">
      <Breadcrumb>All Consumer Groups</Breadcrumb>

      <div className="box">
        <div className="columns">
          <div className="column is-half is-offset-half">
            <input
              id="searchText"
              type="text"
              name="searchText"
              className="input"
              placeholder="Search"
              value={searchText}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <table className="table is-striped is-fullwidth is-hoverable">
          <thead>
            <tr>
              <th>Consumer group ID</th>
              <th>Num of consumers</th>
              <th>Num of topics</th>
            </tr>
          </thead>
          <tbody>
            {consumerGroups
              .filter(
                (consumerGroup) =>
                  !searchText ||
                  consumerGroup?.consumerGroupId?.indexOf(searchText) >= 0
              )
              .map((consumerGroup) => (
                <ListItem
                  key={consumerGroup.consumerGroupId}
                  consumerGroup={consumerGroup}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;
