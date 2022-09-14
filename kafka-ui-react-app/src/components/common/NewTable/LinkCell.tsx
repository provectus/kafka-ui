import React from 'react';
import { CellContext } from '@tanstack/react-table';
import { NavLink } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LinkCell: React.FC<CellContext<any, unknown>> = ({ getValue }) => {
  const value = `${getValue<string | number>()}`;
  const handleClick: React.MouseEventHandler = (e) => e.stopPropagation();
  return (
    <NavLink to={encodeURIComponent(value)} title={value} onClick={handleClick}>
      {value}
    </NavLink>
  );
};

export default LinkCell;
