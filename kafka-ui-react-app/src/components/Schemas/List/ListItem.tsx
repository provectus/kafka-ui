import React from 'react';

interface ListItemProps {
  subject?: string;
}

const ListItem: React.FC<ListItemProps> = ({ subject }) => {
  return (
    <tr>
      <td>{subject}</td>
    </tr>
  );
};

export default ListItem;
