import React from 'react';
import { NavLink } from 'react-router-dom';
import { ConsumerGroup } from 'redux/interfaces';

const ListItem: React.FC<ConsumerGroup> = ({
  consumerGroupId,
  numConsumers,
  numTopics,
}) => {
  return (
    <tr>
      {/* <td>
        <NavLink exact to={`consumer-groups/${consumerGroupId}`} activeClassName="is-active" className="title is-6">
          {consumerGroupId}
        </NavLink>
      </td> */}
      <td>{consumerGroupId}</td>
      <td>{numConsumers}</td>
      <td>{numTopics}</td>
    </tr>
  );
}

export default ListItem;
