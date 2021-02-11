import React from 'react';
import { NavLink } from 'react-router-dom';
import { SchemaSubject } from 'generated-sources';

interface DetailsItemProps {
  schema: SchemaSubject;
}

const DetailsItem: React.FC<DetailsItemProps> = ({ schema }) => {
  return (
    <tr>
      <td>{JSON.stringify(schema)}</td>
    </tr>
  );
};

export default DetailsItem;
