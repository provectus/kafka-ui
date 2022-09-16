import React from 'react';
import * as Metrics from 'components/common/Metrics';
import { useTimeFormat } from 'lib/hooks/useTimeFormat';
import { TopicAnalysisStats } from 'generated-sources';

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
  const dateTimeMin = useTimeFormat(minTimestamp);
  const dateTimeMax = useTimeFormat(maxTimestamp);

  return (
    <Metrics.Section title="Messages">
      <Metrics.Indicator label="Total number">{totalMsgs}</Metrics.Indicator>
      <Metrics.Indicator label="Offsets min-max">
        {`${minOffset} - ${maxOffset}`}
      </Metrics.Indicator>
      <Metrics.Indicator label="Timestamp min-max">
        {`${dateTimeMin} - ${dateTimeMax}`}
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
