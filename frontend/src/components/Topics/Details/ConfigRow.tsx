import React from 'react';

const ConfigRow: React.FC<{name: string, value: string}> = ({
  name,
  value,
}) => (
  <tr>
    <td>{name}</td>
    <td>{value}</td>
  </tr>
);

export default ConfigRow;
