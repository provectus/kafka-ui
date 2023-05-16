import React from 'react';
import { Row } from '@tanstack/react-table';
import Heading from 'components/common/heading/Heading.styled';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import {
  List,
  Label,
} from 'components/common/PropertiesList/PropertiesList.styled';
import { TopicAnalysisStats } from 'generated-sources';
import { formatTimestamp } from 'lib/dateTimeHelpers';

import * as S from './Statistics.styles';

const PartitionInfoRow: React.FC<{ row: Row<TopicAnalysisStats> }> = ({
  row,
}) => {
  const {
    totalMsgs,
    minTimestamp,
    maxTimestamp,
    nullKeys,
    nullValues,
    approxUniqKeys,
    approxUniqValues,
    keySize,
    valueSize,
  } = row.original;
  return (
    <S.PartitionInfo>
      <div>
        <Heading level={4}>Partition stats</Heading>
        <List>
          <Label>Total message</Label>
          <span>{totalMsgs}</span>
          <Label>Total size</Label>
          <BytesFormatted value={(keySize?.sum || 0) + (valueSize?.sum || 0)} />
          <Label>Min. timestamp</Label>
          <span>{formatTimestamp(minTimestamp)}</span>
          <Label>Max. timestamp</Label>
          <span>{formatTimestamp(maxTimestamp)}</span>
          <Label>Null keys amount</Label>
          <span>{nullKeys}</span>
          <Label>Null values amount</Label>
          <span>{nullValues}</span>
          <Label>Approx. unique keys amount</Label>
          <span>{approxUniqKeys}</span>
          <Label>Approx. unique values amount</Label>
          <span>{approxUniqValues}</span>
        </List>
      </div>
      <div>
        <Heading level={4}>Keys sizes</Heading>
        <List>
          <Label>Total keys size</Label>
          <BytesFormatted value={keySize?.sum} />
          <Label>Min key size</Label>
          <BytesFormatted value={keySize?.min} />
          <Label>Max key size</Label>
          <BytesFormatted value={keySize?.max} />
          <Label>Avg key size</Label>
          <BytesFormatted value={keySize?.avg} />
          <Label>Percentile 50</Label>
          <BytesFormatted value={keySize?.prctl50} />
          <Label>Percentile 75</Label>
          <BytesFormatted value={keySize?.prctl75} />
          <Label>Percentile 95</Label>
          <BytesFormatted value={keySize?.prctl95} />
          <Label>Percentile 99</Label>
          <BytesFormatted value={keySize?.prctl99} />
          <Label>Percentile 999</Label>
          <BytesFormatted value={keySize?.prctl999} />
        </List>
      </div>
      <div>
        <Heading level={4}>Values sizes</Heading>
        <List>
          <Label>Total keys size</Label>
          <BytesFormatted value={valueSize?.sum} />
          <Label>Min key size</Label>
          <BytesFormatted value={valueSize?.min} />
          <Label>Max key size</Label>
          <BytesFormatted value={valueSize?.max} />
          <Label>Avg key size</Label>
          <BytesFormatted value={valueSize?.avg} />
          <Label>Percentile 50</Label>
          <BytesFormatted value={valueSize?.prctl50} />
          <Label>Percentile 75</Label>
          <BytesFormatted value={valueSize?.prctl75} />
          <Label>Percentile 95</Label>
          <BytesFormatted value={valueSize?.prctl95} />
          <Label>Percentile 99</Label>
          <BytesFormatted value={valueSize?.prctl99} />
          <Label>Percentile 999</Label>
          <BytesFormatted value={valueSize?.prctl999} />
        </List>
      </div>
    </S.PartitionInfo>
  );
};

export default PartitionInfoRow;
