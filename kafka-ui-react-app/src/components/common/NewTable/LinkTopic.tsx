import React from 'react';
import { NavLink } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LinkTopic = ({ row, to }: any) => {
  const handleClick: React.MouseEventHandler = (e) => e.stopPropagation();
  return (
    <NavLink
      style={{ color: 'blue' }}
      to={to}
      title={row?.original?.name}
      onClick={handleClick}
    >
      {row?.original?.topicCount}
    </NavLink>
  );
};

export default LinkTopic;
