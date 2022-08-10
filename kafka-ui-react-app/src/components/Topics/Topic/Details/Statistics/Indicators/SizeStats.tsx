import React from 'react';
import * as Metrics from 'components/common/Metrics';
import { TopicAnalysisSizeStats } from 'generated-sources';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';

const SizeStats: React.FC<{
  stats: TopicAnalysisSizeStats;
  title: string;
}> = ({
  stats: { sum, min, max, avg, prctl50, prctl75, prctl95, prctl99, prctl999 },
  title,
}) => (
  <Metrics.Section title={title}>
    <Metrics.Indicator label="Total size">
      <BytesFormatted value={sum} />
    </Metrics.Indicator>
    <Metrics.Indicator label="Min size">
      <BytesFormatted value={min} />
    </Metrics.Indicator>
    <Metrics.Indicator label="Max size">
      <BytesFormatted value={max} />
    </Metrics.Indicator>
    <Metrics.Indicator label="Avg key">
      <BytesFormatted value={avg} />
    </Metrics.Indicator>
    <Metrics.Indicator label="Percentile 50">
      <BytesFormatted value={prctl50} />
    </Metrics.Indicator>
    <Metrics.Indicator label="Percentile 75">
      <BytesFormatted value={prctl75} />
    </Metrics.Indicator>
    <Metrics.Indicator label="Percentile 95">
      <BytesFormatted value={prctl95} />
    </Metrics.Indicator>
    <Metrics.Indicator label="Percentile 99">
      <BytesFormatted value={prctl99} />
    </Metrics.Indicator>
    <Metrics.Indicator label="Percentile 999">
      <BytesFormatted value={prctl999} />
    </Metrics.Indicator>
  </Metrics.Section>
);

export default SizeStats;
