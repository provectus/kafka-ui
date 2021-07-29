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

  const toggleSeekDirection = () => {
    const nextSeekDirectionValue =
      seekDirection === SeekDirection.FORWARD
        ? SeekDirection.BACKWARD
        : SeekDirection.FORWARD;
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
      const url = `/api/clusters/${clusterName}/topics/${topicName}/messages${location.search}`;
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
    <>
      <div className="columns is-align-items-flex-end">
        <div className="column is-3">
          <label className="label">Partitions</label>
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
        </div>
        {isSeekTypeControlVisible && (
          <>
            <div className="column is-2">
              <label className="label">Seek Type</label>
              <div className="select is-block">
                <select
                  id="selectSeekType"
                  name="selectSeekType"
                  onChange={({ target: { value } }) =>
                    setSeekType(value as SeekType)
                  }
                  value={seekType}
                >
                  <option value={SeekType.OFFSET}>Offset</option>
                  <option value={SeekType.TIMESTAMP}>Timestamp</option>
                </select>
              </div>
            </div>
            <div className="column is-2">
              {seekType === SeekType.OFFSET ? (
                <>
                  <label className="label">Offset</label>
                  <input
                    id="offset"
                    name="offset"
                    type="text"
                    className="input"
                    value={offset}
                    onChange={({ target: { value } }) => setOffset(value)}
                  />
                </>
              ) : (
                <>
                  <label className="label">Timestamp</label>
                  <DatePicker
                    selected={timestamp}
                    onChange={(date: Date | null) => setTimestamp(date)}
                    showTimeInput
                    timeInputLabel="Time:"
                    dateFormat="MMMM d, yyyy HH:mm"
                    className="input"
                  />
                </>
              )}
            </div>
          </>
        )}
        <div className="column is-3">
          <label className="label">Search</label>
          <input
            id="searchText"
            type="text"
            name="searchText"
            className="input"
            placeholder="Search"
            value={query}
            onChange={({ target: { value } }) => setQuery(value)}
          />
        </div>
        <div className="column is-2">
          {isFetching ? (
            <button
              type="button"
              className="button is-primary is-fullwidth"
              disabled={isSubmitDisabled}
              onClick={handleSSECancel}
            >
              Cancel
            </button>
          ) : (
            <input
              type="submit"
              className="button is-primary is-fullwidth"
              disabled={isSubmitDisabled}
              onClick={handleFiltersSubmit}
            />
          )}
        </div>
      </div>
      <div className="columns">
        <div className="column is-half">
          <div className="field">
            <input
              id="switchRoundedDefault"
              type="checkbox"
              name="switchRoundedDefault"
              className="switch is-rounded"
              checked={seekDirection === SeekDirection.BACKWARD}
              onChange={toggleSeekDirection}
            />
            <label htmlFor="switchRoundedDefault">Newest first</label>
          </div>
        </div>
        <div className="column is-half">
          <div className="tags is-justify-content-flex-end">
            <div className="tag is-white">{isFetching && phaseMessage}</div>
            <div className="tag is-info" title="Elapsed Time">
              <span className="icon">
                <i className="fas fa-clock" />
              </span>
              <span>{Math.max(elapsedMs || 0, 0)}ms</span>
            </div>
            <div className="tag is-info" title="Bytes Consumed">
              <span className="icon">
                <i className="fas fa-download" />
              </span>
              <BytesFormatted value={bytesConsumed} />
            </div>
            <div className="tag is-info" title="Messages Consumed">
              <span className="icon">
                <i className="fas fa-envelope" />
              </span>
              <span>{messagesConsumed}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Filters;
