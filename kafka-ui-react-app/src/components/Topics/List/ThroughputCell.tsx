import React from 'react';
import { CellContext } from '@tanstack/react-table';
import { Topic } from 'generated-sources';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';

function formatThroughput(row: Topic) {
  const production = row.bytesInPerSec;
  const consumption = row.bytesOutPerSec;
  if (production === undefined && consumption === undefined) {
    return <div>N/A</div>;
  }
  if (production === undefined) {
    return (
      <div>
        out: <BytesFormatted value={consumption} />
      </div>
    );
  }
  if (consumption === undefined) {
    return (
      <div>
        in: <BytesFormatted value={production} />
      </div>
    );
  }

  return (
    <div>
      <div>
        in: <BytesFormatted value={production} />
      </div>
      <div>
        out: <BytesFormatted value={consumption} />
      </div>
    </div>
  );
}

export const ThroughputCell: React.FC<CellContext<Topic, unknown>> = ({
  row: { original },
}) => {
  return formatThroughput(original);
};
