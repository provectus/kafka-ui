import React, { ChangeEvent } from 'react';
import { ConsumerGroup, ClusterName } from 'redux/interfaces';
import ListItem from './ListItem';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';

interface Props {
  clusterName: ClusterName;
  consumerGroups: (ConsumerGroup)[];
}

const List: React.FC<Props> = ({
  consumerGroups,
}) => {

  const [searchText, setSearchText] = React.useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const items = consumerGroups;

  return (
    <div className="section">
      <Breadcrumb>All Consumer Groups</Breadcrumb>

      <div className="box">
        <div className="columns">
          <div className="column is-half is-offset-half">
            <input  id="searchText"
                  type="text"
                  name="searchText"
                  className="input"
                  placeholder="Search"
                  value={searchText}
                  onChange={handleInputChange}
                />
          </div>
        </div>
        <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Consumer group ID</th>
              <th>Num of consumers</th>
              <th>Num of topics</th>
            </tr>
          </thead>
          <tbody>
            {items
              .filter( (consumerGroup) => !searchText || consumerGroup?.consumerGroupId?.indexOf(searchText) >= 0)
              .map((consumerGroup, index) => (
                <ListItem
                  key={`consumer-group-list-item-key-${index}`}
                  {...consumerGroup}
                />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;
