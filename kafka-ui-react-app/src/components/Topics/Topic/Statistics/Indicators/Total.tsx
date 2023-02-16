import React from 'react';
import * as Metrics from 'components/common/Metrics';
import { TopicAnalysisStats } from 'generated-sources';
import { formatTimestamp } from 'lib/dateTimeHelpers';

const Total: React.FC<TopicAnalysisStats> = ({
  totalMsgs,
  minOffset,
  maxOffset,
  minTimestamp,
  maxTimestamp,
  nullKeys,
  nullValues,
  approxUniqKeys,
  approxUniqValues,
}) => {
  return (
    <Metrics.Section title="Messages">
      <Metrics.Indicator label="Total number">{totalMsgs}</Metrics.Indicator>
      <Metrics.Indicator label="Offsets min-max">
        {`${minOffset} - ${maxOffset}`}
      </Metrics.Indicator>
      <Metrics.Indicator label="Timestamp min-max">
        {`${formatTimestamp(minTimestamp)} - ${formatTimestamp(maxTimestamp)}`}
      </Metrics.Indicator>
      <Metrics.Indicator label="Null keys">{nullKeys}</Metrics.Indicator>
      <Metrics.Indicator
        label="Unique keys"
        title="Approximate number of unique keys"
      >
        {approxUniqKeys}
      </Metrics.Indicator>
      <Metrics.Indicator label="Null values">{nullValues}</Metrics.Indicator>
      <Metrics.Indicator
        label="Unique values"
        title="Approximate number of unique values"
      >
        {approxUniqValues}
      </Metrics.Indicator>
    </Metrics.Section>
  );
};

export default Total;
