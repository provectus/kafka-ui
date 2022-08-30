import React from 'react';
import { CellContext } from '@tanstack/react-table';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SizeCell: React.FC<CellContext<any, unknown>> = ({ getValue }) => (
  <BytesFormatted value={getValue<string | number>()} />
);

export default SizeCell;
