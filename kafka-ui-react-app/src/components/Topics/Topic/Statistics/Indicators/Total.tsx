import React from 'react';
import * as Metrics from 'components/common/Metrics';
import { formatTimestamp } from 'lib/dateTimeHelpers';
import { useTimeFormatStats } from 'lib/hooks/api/timeFormat';
import { TimeStampFormat, TopicAnalysisStats } from 'generated-sources';

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
  const { data } = useTimeFormatStats();
  const { timeStampFormat } = data as TimeStampFormat;

  return (
    <Metrics.Section title="Messages">
      <Metrics.Indicator label="Total number">{totalMsgs}</Metrics.Indicator>
      <Metrics.Indicator label="Offsets min-max">
        {`${minOffset} - ${maxOffset}`}
      </Metrics.Indicator>
      <Metrics.Indicator label="Timestamp min-max">
        {`${formatTimestamp(minTimestamp, timeStampFormat)} - ${formatTimestamp(
          maxTimestamp,
          timeStampFormat
        )}`}
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
