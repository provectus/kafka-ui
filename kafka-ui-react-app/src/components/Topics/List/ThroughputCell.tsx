import React from 'react';
import { CellContext } from '@tanstack/react-table';
import { Topic } from 'generated-sources';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import ArrowDownIcon from 'components/common/Icons/ArrowDownIcon';
import ArrowUpIcon from 'components/common/Icons/ArrowUpIcon';

export const ThroughputCell: React.FC<CellContext<Topic, unknown>> = ({
  row: { original },
}) => {
  const production = original.bytesInPerSec;
  const consumption = original.bytesOutPerSec;
  if (production === undefined && consumption === undefined) {
    return (
      <>
        <ArrowDownIcon /> N/A <ArrowUpIcon /> N/A
      </>
    );
  }
  if (production === undefined) {
    return (
      <>
        <ArrowUpIcon /> <BytesFormatted value={consumption} />
      </>
    );
  }
  if (consumption === undefined) {
    return (
      <>
        <ArrowDownIcon /> <BytesFormatted value={production} />
      </>
    );
  }

  return (
    <>
      <ArrowDownIcon /> <BytesFormatted value={production} /> <ArrowUpIcon />{' '}
      <BytesFormatted value={consumption} />
    </>
  );
};
