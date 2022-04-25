import React from 'react';

interface Props {
  accessors: string[];
  data: Record<string, string>;
}

const ListItem: React.FC<Props> = ({ accessors, data }) => {
  return (
    <tr>
      {accessors.map((accessor: string) => (
        <td key={accessor}>{data[accessor]}</td>
      ))}
    </tr>
  );
};

export default ListItem;
