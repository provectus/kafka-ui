import 'react-datepicker/dist/react-datepicker.css';

import {
  Partition,
  SeekDirection,
  SeekType,
  TopicMessage,
  TopicMessageConsuming,
  TopicMessageEvent,
  TopicMessageEventTypeEnum,
} from 'generated-sources';
import * as React from 'react';
import { omitBy } from 'lodash';
import { useHistory, useLocation } from 'react-router';
import DatePicker from 'react-datepicker';
import MultiSelect from 'react-multi-select-component';
import { Option } from 'react-multi-select-component/dist/lib/interfaces';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { TopicName, ClusterName } from 'redux/interfaces';
import { BASE_PARAMS } from 'lib/constants';
import Input from 'components/common/Input/Input';
import Select from 'components/common/Select/Select';
import { Button } from 'components/common/Button/Button';

import {
  FilterInputs,
  FiltersMetrics,
  FiltersWrapper,
  Metric,
  MetricsIcon,
  SeekTypeSelectorWrapper,
} from './Filters.styled';
import {
  filterOptions,
  getOffsetFromSeekToParam,
  getSelectedPartitionsFromSeekToParam,
  getTimestampFromSeekToParam,
} from './utils';

type Query = Record<string, string | string[] | number>;

export interface FiltersProps {
  clusterName: ClusterName;
  topicName: TopicName;
  phaseMessage?: string;
  partitions: Partition[];
  meta: TopicMessageConsuming;
  isFetching: boolean;
  addMessage(message: TopicMessage): void;
  resetMessages(): void;
  updatePhase(phase: string): void;
  updateMeta(meta: TopicMessageConsuming): void;
  setIsFetching(status: boolean): void;
}

const PER_PAGE = 100;

const Filters: React.FC<FiltersProps> = ({
  clusterName,
  topicName,
  partitions,
  phaseMessage,
  meta: { elapsedMs, bytesConsumed, messagesConsumed },
  isFetching,
  addMessage,
  resetMessages,
  updatePhase,
  updateMeta,
  setIsFetching,
}) => {
  const location = useLocation();
  const history = useHistory();

  const source = React.useRef<EventSource | null>(null);

  const searchParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location]
  );

  const [selectedPartitions, setSelectedPartitions] = React.useState<Option[]>(
    getSelectedPartitionsFromSeekToParam(searchParams, partitions)
  );

  const [attempt, setAttempt] = React.useState(0);
  const [seekType, setSeekType] = React.useState<SeekType>(
    (searchParams.get('seekType') as SeekType) || SeekType.OFFSET
  );
  const [offset, setOffset] = React.useState<string>(
    getOffsetFromSeekToParam(searchParams)
  );

  const [timestamp, setTimestamp] = React.useState<Date | null>(
    getTimestampFromSeekToParam(searchParams)
  );
  const [query, setQuery] = React.useState<string>(searchParams.get('q') || '');
  const [seekDirection, setSeekDirection] = React.useState<SeekDirection>(
    (searchParams.get('seekDirection') as SeekDirection) ||
      SeekDirection.FORWARD
  );

  const isSeekTypeControlVisible = React.useMemo(
    () => selectedPartitions.length > 0,
    [selectedPartitions]
  );

  const isSubmitDisabled = React.useMemo(() => {
    if (isSeekTypeControlVisible) {
      return seekType === SeekType.TIMESTAMP && !timestamp;
    }

    return false;
  }, [isSeekTypeControlVisible, seekType, timestamp]);

  const partitionMap = React.useMemo(
    () =>
      partitions.reduce<Record<string, Partition>>(
        (acc, partition) => ({
          ...acc,
          [partition.partition]: partition,
        }),
        {}
      ),
    [partitions]
  );

  const handleFiltersSubmit = () => {
    setAttempt(attempt + 1);

    const props: Query = {
      q: query,
      attempt,
      limit: PER_PAGE,
      seekDirection,
    };

    if (isSeekTypeControlVisible) {
      props.seekType = seekType;
      props.seekTo = selectedPartitions.map(({ value }) => {
        let seekToOffset;

        if (seekType === SeekType.OFFSET) {
          if (offset) {
            seekToOffset = offset;
          } else {
            seekToOffset =
              seekDirection === SeekDirection.FORWARD
                ? partitionMap[value].offsetMin
                : partitionMap[value].offsetMax;
          }
        } else if (timestamp) {
          seekToOffset = timestamp.getTime();
        }

        return `${value}::${seekToOffset || '0'}`;
      });
    }

    const newProps = omitBy(props, (v) => v === undefined || v === '');
    const qs = Object.keys(newProps)
      .map((key) => `${key}=${newProps[key]}`)
      .join('&');

    history.push({
      search: `?${qs}`,
    });
  };

  const toggleSeekDirection = (val: string) => {
    const nextSeekDirectionValue =
      val === SeekDirection.FORWARD
        ? SeekDirection.FORWARD
        : SeekDirection.BACKWARD;
    setSeekDirection(nextSeekDirectionValue);
  };

  const handleSSECancel = () => {
    if (!source.current) return;

    setIsFetching(false);
    source.current.close();
  };

  // eslint-disable-next-line consistent-return
  React.useEffect(() => {
    if (location.search.length !== 0) {
      const url = `${BASE_PARAMS.basePath}/api/clusters/${clusterName}/topics/${topicName}/messages${location.search}`;
      const sse = new EventSource(url);

      source.current = sse;
      setIsFetching(true);

      sse.onopen = () => {
        resetMessages();
        setIsFetching(true);
      };
      sse.onmessage = ({ data }) => {
        const { type, message, phase, consuming }: TopicMessageEvent =
          JSON.parse(data);

        switch (type) {
          case TopicMessageEventTypeEnum.MESSAGE:
            if (message) addMessage(message);
            break;
          case TopicMessageEventTypeEnum.PHASE:
            if (phase?.name) updatePhase(phase.name);
            break;
          case TopicMessageEventTypeEnum.CONSUMING:
            if (consuming) updateMeta(consuming);
            break;
          default:
        }
      };

      sse.onerror = () => {
        setIsFetching(false);
        sse.close();
      };

      return () => {
        setIsFetching(false);
        sse.close();
      };
    }
  }, [clusterName, topicName, location]);

  React.useEffect(() => {
    if (location.search.length === 0) {
      handleFiltersSubmit();
    }
  }, [location]);

  React.useEffect(() => {
    handleFiltersSubmit();
  }, [seekDirection]);

  return (
    <FiltersWrapper>
      <div>
        <FilterInputs>
          <Input
            inputSize="M"
            id="searchText"
            type="text"
            leftIcon="fas fa-search"
            placeholder="Search"
            value={query}
            onChange={({ target: { value } }) => setQuery(value)}
          />
          {isSeekTypeControlVisible && (
            <SeekTypeSelectorWrapper>
              <Select
                id="selectSeekType"
                onChange={({ target: { value } }) =>
                  setSeekType(value as SeekType)
                }
                value={seekType}
                selectSize="M"
              >
                <option value={SeekType.OFFSET}>Offset</option>
                <option value={SeekType.TIMESTAMP}>Timestamp</option>
              </Select>
              {seekType === SeekType.OFFSET ? (
                <Input
                  id="offset"
                  type="text"
                  inputSize="M"
                  value={offset}
                  className="offset-selector"
                  onChange={({ target: { value } }) => setOffset(value)}
                />
              ) : (
                <DatePicker
                  selected={timestamp}
                  onChange={(date: Date | null) => setTimestamp(date)}
                  showTimeInput
                  timeInputLabel="Time:"
                  dateFormat="MMMM d, yyyy HH:mm"
                  className="date-picker"
                  placeholderText="Select timestamp"
                />
              )}
            </SeekTypeSelectorWrapper>
          )}
          <MultiSelect
            options={partitions.map((p) => ({
              label: `Partition #${p.partition.toString()}`,
              value: p.partition,
            }))}
            filterOptions={filterOptions}
            value={selectedPartitions}
            onChange={setSelectedPartitions}
            labelledBy="Select partitions"
          />
          {isFetching ? (
            <Button
              type="button"
              buttonType="secondary"
              buttonSize="M"
              disabled={isSubmitDisabled}
              onClick={handleSSECancel}
              style={{ fontWeight: 500 }}
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="submit"
              buttonType="secondary"
              buttonSize="M"
              disabled={isSubmitDisabled}
              onClick={handleFiltersSubmit}
              style={{ fontWeight: 500 }}
            >
              Submit
            </Button>
          )}
        </FilterInputs>
        <Select
          selectSize="M"
          onChange={(e) => toggleSeekDirection(e.target.value)}
          value={seekDirection}
        >
          <option value={SeekDirection.FORWARD}>Oldest first</option>
          <option value={SeekDirection.BACKWARD}>Newest first</option>
        </Select>
      </div>
      <FiltersMetrics>
        <p style={{ fontSize: 14 }}>{isFetching && phaseMessage}</p>
        <Metric title="Elapsed Time">
          <MetricsIcon>
            <i className="far fa-clock" />
          </MetricsIcon>
          <span>{Math.max(elapsedMs || 0, 0)} ms</span>
        </Metric>
        <Metric title="Bytes Consumed">
          <MetricsIcon>
            <i className="fas fa-arrow-down" />
          </MetricsIcon>
          <BytesFormatted value={bytesConsumed} />
        </Metric>
        <Metric title="Messages Consumed">
          <MetricsIcon>
            <i className="far fa-file-alt" />
          </MetricsIcon>
          <span>{messagesConsumed} messages</span>
        </Metric>
      </FiltersMetrics>
    </FiltersWrapper>
  );
};

export default Filters;
