import React from 'react';
import { SchemaSubject } from 'generated-sources';
import { NavLink } from 'react-router-dom';
import { Colors } from 'theme/theme';

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
          style={{ fontWeight: 500, color: Colors.neutral[90] }}
          exact
          to={`schemas/${subject}`}
          activeClassName="is-active"
        >
          {subject}
        </NavLink>
      </td>
      <td>{version}</td>
      <td>{compatibilityLevel}</td>
    </tr>
  );
};

export default ListItem;
