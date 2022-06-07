import React from 'react';
import { KsqlDescription } from 'redux/interfaces/ksqlDb';
import { KsqlDescriptionAccessor } from 'components/KsqlDb/List/List';

interface Props {
  accessors: KsqlDescriptionAccessor[];
  data: KsqlDescription;
}

const ListItem: React.FC<Props> = ({ accessors, data }) => {
  return (
    <tr>
      {accessors.map((accessor) => (
        <td key={accessor}>{data[accessor]}</td>
      ))}
    </tr>
  );
};

export default ListItem;
