import React from 'react';
import { CellContext } from '@tanstack/react-table';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsAny = any;

const SizeCell: React.FC<
  CellContext<AsAny, unknown> & { renderSegments?: boolean }
> = ({ getValue, row, renderSegments = false }) => (
  <>
    <BytesFormatted value={getValue<string | number>()} />
    {renderSegments ? `, ${row?.original.count} segment(s)` : null}
  </>
);

export default SizeCell;
