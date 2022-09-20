import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import ArrowDownIcon from 'components/common/Icons/ArrowDownIcon';
import ClockIcon from 'components/common/Icons/ClockIcon';
import FileIcon from 'components/common/Icons/FileIcon';
import { TopicMessageConsuming } from 'generated-sources';
import { formatMilliseconds } from 'lib/dateTimeHelpers';
import React from 'react';

import * as S from './FiltersBar.styled';

interface MetaProps {
  meta?: TopicMessageConsuming;
  phase?: string;
  isFetching: boolean;
}

const Meta: React.FC<MetaProps> = ({ meta = {} }) => {
  const { bytesConsumed, messagesConsumed, elapsedMs } = meta;

  return (
    <S.Meta>
      <S.MetaRow>
        <S.Metric title="Messages Consumed">
          <S.MetricIcon>
            <FileIcon />
          </S.MetricIcon>
          <span>{messagesConsumed || 0} msg.</span>
        </S.Metric>
        <S.Metric title="Bytes Consumed">
          <S.MetricIcon>
            <ArrowDownIcon />
          </S.MetricIcon>
          <BytesFormatted value={bytesConsumed || 0} />
        </S.Metric>
        <S.Metric title="Elapsed Time">
          <S.MetricIcon>
            <ClockIcon />
          </S.MetricIcon>
          <span>{formatMilliseconds(elapsedMs)}</span>
        </S.Metric>
      </S.MetaRow>
    </S.Meta>
  );
};

export default Meta;
