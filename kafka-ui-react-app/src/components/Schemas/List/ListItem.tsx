import React from 'react';
import { SchemaSubject } from 'generated-sources';
import { NavLink } from 'react-router-dom';

export interface ListItemProps {
  subject: SchemaSubject;
}

const ListItem: React.FC<ListItemProps> = ({
  subject: { subject, version, compatibilityLevel },
}) => {
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
      <td>{version}</td>
      <td>
        <span className="tag is-link">{compatibilityLevel}</span>
      </td>
    </tr>
  );
};

export default ListItem;
