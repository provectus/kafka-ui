import React from 'react';
import { KsqlDescription } from 'redux/interfaces/ksqlDb';

interface Props {
  accessors: (keyof KsqlDescription)[];
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
