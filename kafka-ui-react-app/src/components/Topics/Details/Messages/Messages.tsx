import 'react-datepicker/dist/react-datepicker.css';
import React, { useCallback, useEffect, useRef } from 'react';
import { groupBy, map, concat, maxBy } from 'lodash';
import MultiSelect from 'react-multi-select-component';
import { Option } from 'react-multi-select-component/dist/lib/interfaces';
import { useDebouncedCallback } from 'use-debounce';
import {
  ClusterName,
  TopicMessageQueryParams,
  TopicName,
} from 'redux/interfaces';
import { TopicMessage, Partition, SeekType } from 'generated-sources';
import PageLoader from 'components/common/PageLoader/PageLoader';
import DatePicker from 'react-datepicker';
import MessagesTable from './MessagesTable';

export interface Props {
  clusterName: ClusterName;
  topicName: TopicName;
  isFetched: boolean;
  fetchTopicMessages: (
    clusterName: ClusterName,
    topicName: TopicName,
    queryParams: Partial<TopicMessageQueryParams>
  ) => void;
  messages: TopicMessage[];
  partitions: Partition[];
}

interface FilterProps {
  offset: TopicMessage['offset'];
  partition: TopicMessage['partition'];
}

function usePrevious(value: Date | null) {
  const ref = useRef<Date | null>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const Messages: React.FC<Props> = ({
  isFetched,
  clusterName,
  topicName,
  messages,
  partitions,
  fetchTopicMessages,
}) => {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [searchTimestamp, setSearchTimestamp] = React.useState<Date | null>(
    null
  );
  const [filterProps, setFilterProps] = React.useState<FilterProps[]>([]);
  const [selectedSeekType, setSelectedSeekType] = React.useState<SeekType>(
    SeekType.OFFSET
  );
  const [searchOffset, setSearchOffset] = React.useState<string>();
  const [selectedPartitions, setSelectedPartitions] = React.useState<Option[]>(
    partitions.map((p) => ({
      value: p.partition,
      label: p.partition.toString(),
    }))
  );
  const [queryParams, setQueryParams] = React.useState<
    Partial<TopicMessageQueryParams>
  >({ limit: 100 });
  const [debouncedCallback] = useDebouncedCallback(
    (query: Partial<TopicMessageQueryParams>) =>
      setQueryParams({ ...queryParams, ...query }),
    1000
  );

  const prevSearchTimestamp = usePrevious(searchTimestamp);

  const getUniqueDataForEachPartition: FilterProps[] = React.useMemo(() => {
    const partitionUniqs: FilterProps[] = partitions.map((p) => ({
      offset: 0,
      partition: p.partition,
    }));
    const messageUniqs: FilterProps[] = map(
      groupBy(messages, 'partition'),
      (v) => maxBy(v, 'offset')
    ).map((v) => ({
      offset: v ? v.offset : 0,
      partition: v ? v.partition : 0,
    }));

    return map(
      groupBy(concat(partitionUniqs, messageUniqs), 'partition'),
      (v) => maxBy(v, 'offset') as FilterProps
    );
  }, [messages, partitions]);

  const getSeekToValuesForPartitions = (partition: Option) => {
    const foundedValues = filterProps.find(
      (prop) => prop.partition === partition.value
    );
    if (selectedSeekType === SeekType.OFFSET) {
      return foundedValues ? foundedValues.offset : 0;
    }
    return searchTimestamp ? searchTimestamp.getTime() : null;
  };

  React.useEffect(() => {
    fetchTopicMessages(clusterName, topicName, queryParams);
  }, []);

  React.useEffect(() => {
    setFilterProps(getUniqueDataForEachPartition);
  }, [messages, partitions]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;

    setSearchQuery(query);
    debouncedCallback({ q: query });
  };

  const handleDateTimeChange = () => {
    if (searchTimestamp !== prevSearchTimestamp) {
      if (searchTimestamp) {
        const timestamp: number = searchTimestamp.getTime();

        setSearchTimestamp(searchTimestamp);
        setQueryParams({
          ...queryParams,
          seekType: SeekType.TIMESTAMP,
          seekTo: selectedPartitions.map((p) => `${p.value}::${timestamp}`),
        });
      } else {
        setSearchTimestamp(null);
        const { seekTo, seekType, ...queryParamsWithoutSeek } = queryParams;
        setQueryParams(queryParamsWithoutSeek);
      }
    }
  };

  const handleSeekTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedSeekType(event.target.value as SeekType);
  };

  const handleOffsetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const offset = event.target.value || '0';
    setSearchOffset(offset);
    debouncedCallback({
      seekType: SeekType.OFFSET,
      seekTo: selectedPartitions.map((p) => `${p.value}::${offset}`),
    });
  };

  const handlePartitionsChange = (options: Option[]) => {
    setSelectedPartitions(options);

    debouncedCallback({
      seekType: options.length > 0 ? selectedSeekType : undefined,
      seekTo:
        options.length > 0
          ? options.map((p) => `${p.value}::${getSeekToValuesForPartitions(p)}`)
          : undefined,
    });
  };

  const handleFiltersSubmit = useCallback(() => {
    fetchTopicMessages(clusterName, topicName, queryParams);
  }, [clusterName, topicName, queryParams]);

  const onNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const seekTo: string[] = filterProps
      .filter(
        (value) =>
          selectedPartitions.findIndex((p) => p.value === value.partition) > -1
      )
      .map((p) => `${p.partition}::${p.offset}`);

    fetchTopicMessages(clusterName, topicName, {
      ...queryParams,
      seekType: SeekType.OFFSET,
      seekTo,
    });
  };

  const filterOptions = (options: Option[], filter: string) => {
    if (!filter) {
      return options;
    }
    return options.filter(
      ({ value }) => value.toString() && value.toString() === filter
    );
  };

  if (!isFetched) {
    return <PageLoader />;
  }

  return (
    <div>
      <div className="columns">
        <div className="column is-one-fifth">
          <label className="label">Partitions</label>
          <MultiSelect
            options={partitions.map((p) => ({
              label: `Partition #${p.partition.toString()}`,
              value: p.partition,
            }))}
            filterOptions={filterOptions}
            value={selectedPartitions}
            onChange={handlePartitionsChange}
            labelledBy="Select partitions"
          />
        </div>
        <div className="column is-one-fifth">
          <label className="label">Seek Type</label>
          <div className="select is-block">
            <select
              id="selectSeekType"
              name="selectSeekType"
              onChange={handleSeekTypeChange}
              value={selectedSeekType}
            >
              <option value={SeekType.OFFSET}>Offset</option>
              <option value={SeekType.TIMESTAMP}>Timestamp</option>
            </select>
          </div>
        </div>
        <div className="column is-one-fifth">
          {selectedSeekType === SeekType.OFFSET ? (
            <>
              <label className="label">Offset</label>
              <input
                id="searchOffset"
                name="searchOffset"
                type="text"
                className="input"
                value={searchOffset}
                onChange={handleOffsetChange}
              />
            </>
          ) : (
            <>
              <label className="label">Timestamp</label>
              <DatePicker
                selected={searchTimestamp}
                onChange={(date: Date | null) => setSearchTimestamp(date)}
                onCalendarClose={handleDateTimeChange}
                showTimeInput
                timeInputLabel="Time:"
                dateFormat="MMMM d, yyyy h:mm aa"
                className="input"
              />
            </>
          )}
        </div>
        <div className="column is-two-fifths">
          <label className="label">Search</label>
          <input
            id="searchText"
            type="text"
            name="searchText"
            className="input"
            placeholder="Search"
            value={searchQuery}
            onChange={handleQueryChange}
          />
        </div>
      </div>
      <div className="columns">
        <div className="column is-full" style={{ textAlign: 'right' }}>
          <input
            type="submit"
            className="button is-primary"
            onClick={handleFiltersSubmit}
          />
        </div>
      </div>
      <MessagesTable messages={messages} onNext={onNext} />
    </div>
  );
};

export default Messages;
