import React from 'react';

interface ListItemProps {
  schemaName: string;
}

const ListItem: React.FC<ListItemProps> = ({ schemaName }) => {
  return (
    <tr>
      <td>{schemaName}</td>
    </tr>
  );
};

export default ListItem;
