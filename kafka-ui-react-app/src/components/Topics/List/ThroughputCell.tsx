import React from 'react';
import { CellContext } from '@tanstack/react-table';
import { Topic } from 'generated-sources';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';

export const ThroughputCell: React.FC<CellContext<Topic, unknown>> = ({
  row: { original },
}) => {
  const production = original.bytesInPerSec;
  const consumption = original.bytesOutPerSec;
  if (production === undefined && consumption === undefined) {
    return <>N/A</>;
  }
  if (production === undefined) {
    return (
      <>
        out: <BytesFormatted value={consumption} />
      </>
    );
  }
  if (consumption === undefined) {
    return (
      <>
        in: <BytesFormatted value={production} />
      </>
    );
  }

  return (
    <>
      <div>
        in: <BytesFormatted value={production} />
      </div>
      <div>
        out: <BytesFormatted value={consumption} />
      </div>
    </>
  );
};
