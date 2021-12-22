import React from 'react';
import { SchemaSubject } from 'generated-sources';
import { NavLink } from 'react-router-dom';
import { TableKeyLink } from 'components/common/table/Table/TableKeyLink.styled';

export interface ListItemProps {
  subject: SchemaSubject;
}

const ListItem: React.FC<ListItemProps> = ({
  subject: { subject, version, compatibilityLevel },
}) => {
  return (
    <tr>
      <TableKeyLink>
        <NavLink exact to={`schemas/${subject}`}>
          {subject}
        </NavLink>
      </TableKeyLink>
      <td>{version}</td>
      <td>{compatibilityLevel}</td>
    </tr>
  );
};

export default ListItem;
