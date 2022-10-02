import React from 'react';
import { CellContext } from '@tanstack/react-table';
import { NavLink } from 'react-router-dom';
import { clusterTopicsPath } from 'lib/paths';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LinkTopic: React.FC<CellContext<any, unknown>> = ({ getValue, row }) => {
  const value = getValue<string>();
  const handleClick: React.MouseEventHandler = (e) => e.stopPropagation();
  return (
    <NavLink
      style={{ color: 'blue' }}
      to={clusterTopicsPath(row.original.name)}
      title={value}
      onClick={handleClick}
    >
      {value}
    </NavLink>
  );
};

export default LinkTopic;
