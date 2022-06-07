import React from 'react';
import { SchemaSubject } from 'generated-sources';
import { NavLink } from 'react-router-dom';
import * as S from 'components/common/table/Table/TableKeyLink.styled';

export interface ListItemProps {
  subject: SchemaSubject;
}

const ListItem: React.FC<ListItemProps> = ({
  subject: { subject, version, compatibilityLevel },
}) => {
  return (
    <tr>
      <S.TableKeyLink>
        <NavLink to={subject} role="link">
          {subject}
        </NavLink>
      </S.TableKeyLink>
      <td role="cell">{version}</td>
      <td role="cell">{compatibilityLevel}</td>
    </tr>
  );
};

export default ListItem;
