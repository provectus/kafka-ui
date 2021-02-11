import React from 'react';
import { NavLink } from 'react-router-dom';

interface ListItemProps {
  subject?: string;
}

const ListItem: React.FC<ListItemProps> = ({ subject }) => {
  return (
    <tr>
      <td>
        <NavLink
          exact
          to={`schemas/${subject}/latest`}
          activeClassName="is-active"
          className="title is-6"
        >
          {subject}
        </NavLink>
      </td>
    </tr>
  );
};

export default ListItem;
