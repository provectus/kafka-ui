import { CellContext } from '@tanstack/react-table';
import React from 'react';
import { NavLink } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LinkCell: React.FC<CellContext<any, unknown>> = ({ getValue }) => {
  const value = `${getValue<string | number>()}`;
  return (
    <NavLink to={value} title={value}>
      {value}
    </NavLink>
  );
};

export default LinkCell;
