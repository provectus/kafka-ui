import React from 'react';
import { NavLink } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LinkCell = ({ value, to = '' }: any) => {
  const handleClick: React.MouseEventHandler = (e) => e.stopPropagation();
  return (
    <NavLink to={to} title={value} onClick={handleClick}>
      {value}
    </NavLink>
  );
};

export default LinkCell;
