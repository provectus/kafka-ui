import 'react-datepicker/dist/react-datepicker.css';

import {
  Partition,
  SeekDirection,
  SeekType,
  TopicMessageConsuming,
} from 'generated-sources';
import * as React from 'react';
import { omitBy } from 'lodash';
import DatePicker from 'react-datepicker';
import MultiSelect from 'react-multi-select-component';
import { Option } from 'react-multi-select-component/dist/lib/interfaces';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';

import { filterOptions } from './utils';

export type Query = Record<string, string | string[] | number>;

export interface FiltersProps {
  partitions: Partition[];
  meta: TopicMessageConsuming;
  phase?: string;
  isFetching: boolean;
  onSubmit(query: Query): void;
}

const PER_PAGE = 100;

const Filters: React.FC<FiltersProps> = ({
  partitions,
  phase,
  meta: { elapsedMs, bytesConsumed, messagesConsumed },
  isFetching,
  onSubmit,
}) => {
  const [attempt, setAttempt] = React.useState(0);
  const [selectedPartitions, setSelectedPartitions] = React.useState<Option[]>(
    partitions.map(({ partition }) => ({
      value: partition,
      label: partition.toString(),
    }))
  );
  const [seekType, setSeekType] = React.useState<SeekType>(SeekType.OFFSET);
  const [offset, setOffset] = React.useState<string>('');
  const [timestamp, setTimestamp] = React.useState<Date | null>(null);
  const [query, setQuery] = React.useState<string>('');
  const [seekDirection, setSeekDirection] = React.useState<SeekDirection>(
    SeekDirection.FORWARD
  );
  const isSeekTypeControlVisible = React.useMemo(
    () => selectedPartitions.length > 0,
    [selectedPartitions]
  );

  const isSubmitDisabled = React.useMemo(() => {
    if (isFetching) return true;

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

  const toggleSeekDirection = () => {
    const nextSeekDirectionValue =
      seekDirection === SeekDirection.FORWARD
        ? SeekDirection.BACKWARD
        : SeekDirection.FORWARD;
    setSeekDirection(nextSeekDirectionValue);
  };

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

    onSubmit(omitBy(props, (v) => v === undefined || v === ''));
  };

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
          <input
            type="submit"
            className="button is-primary is-fullwidth"
            disabled={isSubmitDisabled}
            onClick={handleFiltersSubmit}
          />
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
            <div className={`tag is-white ${!isFetching && 'is-hidden'}`}>
              {phase}
            </div>
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
