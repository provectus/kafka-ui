import React, { useEffect, useState } from 'react';
import {
  useAnalyzeTopic,
  useCancelTopicAnalysis,
  useTopicAnalysis,
} from 'lib/hooks/api/topics';
import useAppParams from 'lib/hooks/useAppParams';
import { RouteParamsClusterTopic } from 'lib/paths';
import { Button } from 'components/common/Button/Button';
import * as Informers from 'components/common/Metrics';
import ProgressBar from 'components/common/ProgressBar/ProgressBar';
import {
  List,
  Label,
} from 'components/common/PropertiesList/PropertiesList.styled';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { useTimeFormat } from 'lib/hooks/useTimeFormat';

import * as S from './Statistics.styles';
import Total from './Indicators/Total';
import SizeStats from './Indicators/SizeStats';
import PartitionTable from './PartitionTable';

const Metrics: React.FC = () => {
  const formatTimestamp = useTimeFormat();

  const params = useAppParams<RouteParamsClusterTopic>();
  const [isAnalyzing, setIsAnalyzing] = React.useState(true);
  const analyzeTopic = useAnalyzeTopic(params);
  const cancelTopicAnalysis = useCancelTopicAnalysis(params);

  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  const { data } = useTopicAnalysis(params, isAnalyzing);

  const getTime = () => {
    setMinutes(Math.floor(seconds / 60));
    setSeconds(Math.floor(seconds + 1));
  };

  useEffect(() => {
    if (data && !data.progress) {
      setIsAnalyzing(false);
    }
  }, [data]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (data?.progress) {
      const interval = setInterval(() => getTime(), 1000);
      return () => clearInterval(interval);
    }
  }, [seconds, data]);

  if (!data) {
    return null;
  }

  const passedTime = (time: number) => (time < 10 ? `0${time}` : time);

  if (data.progress) {
    return (
      <S.ProgressContainer>
        <S.ProgressBarWrapper>
          <ProgressBar completed={data.progress.completenessPercent || 0} />
          <span> {data.progress.completenessPercent || 0} %</span>
        </S.ProgressBarWrapper>
        <Button
          onClick={async () => {
            await cancelTopicAnalysis.mutateAsync();
            setIsAnalyzing(true);
          }}
          buttonType="primary"
          buttonSize="M"
        >
          Stop Analysis
        </Button>
        <List>
          <Label>Started at</Label>
          <span>{formatTimestamp(data.progress.startedAt, 'hh:mm:ss a')}</span>
          <Label>Passed at</Label>
          <S.PassedTime>
            <span>{`${passedTime(minutes)} : ${passedTime(
              seconds % 60
            )}`}</span>
            <span>s</span>
          </S.PassedTime>
          <Label>Scanned messages</Label>
          <span>{data.progress.msgsScanned}</span>
          <Label>Scanned bytes</Label>
          <span>
            <BytesFormatted value={data.progress.bytesScanned} />
          </span>
        </List>
      </S.ProgressContainer>
    );
  }

  if (!data.result) {
    return null;
  }

  const totalStats = data.result.totalStats || {};
  const partitionStats = data.result.partitionStats || [];

  return (
    <>
      <S.ActionsBar>
        <S.CreatedAt>{formatTimestamp(data?.result?.finishedAt)}</S.CreatedAt>
        <Button
          onClick={async () => {
            await analyzeTopic.mutateAsync();
            setIsAnalyzing(true);
          }}
          buttonType="primary"
          buttonSize="S"
        >
          Restart Analysis
        </Button>
      </S.ActionsBar>

      <Informers.Wrapper>
        <Total {...totalStats} />
        {totalStats.keySize && (
          <SizeStats stats={totalStats.keySize} title="Key size" />
        )}
        {totalStats.valueSize && (
          <SizeStats stats={totalStats.valueSize} title="Value size" />
        )}
      </Informers.Wrapper>
      <PartitionTable data={partitionStats} />
    </>
  );
};

export default Metrics;
