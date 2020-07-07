import React, { useEffect, useRef } from 'react';
import {
  ClusterName,
  SeekType,
  SeekTypes,
  TopicMessage,
  TopicMessageQueryParams,
  TopicName,
  TopicPartition,
} from 'redux/interfaces';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import CustomParamButton, {
  CustomParamButtonType,
} from 'components/Topics/shared/Form/CustomParams/CustomParamButton';

import MultiSelect from 'react-multi-select-component';

import * as _ from 'lodash';
import { useDebouncedCallback } from 'use-debounce';
import { Option } from 'react-multi-select-component/dist/lib/interfaces';

interface Props {
  clusterName: ClusterName;
  topicName: TopicName;
  isFetched: boolean;
  fetchTopicMessages: (
    clusterName: ClusterName,
    topicName: TopicName,
    queryParams: Partial<TopicMessageQueryParams>
  ) => void;
  messages: TopicMessage[];
  partitions: TopicPartition[];
}

interface FilterProps {
  offset: number;
  partition: number;
}

function usePrevious(value: any) {
  const ref = useRef();
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
    SeekTypes.OFFSET
  );
  const [searchOffset, setSearchOffset] = React.useState<string>('0');
  const [selectedPartitions, setSelectedPartitions] = React.useState<Option[]>(
    []
  );
  const [queryParams, setQueryParams] = React.useState<
    Partial<TopicMessageQueryParams>
  >({ limit: 100 });
  const [debouncedCallback] = useDebouncedCallback(
    (query: any) => setQueryParams({ ...queryParams, ...query }),
    1000
  );

  const prevSearchTimestamp = usePrevious(searchTimestamp);

  const getUniqueDataForEachPartition: FilterProps[] = React.useMemo(() => {
    const partitionUniqs: FilterProps[] = partitions.map((p) => ({
      offset: 0,
      partition: p.partition,
    }));
    const messageUniqs: FilterProps[] = _.map(
      _.groupBy(messages, 'partition'),
      (v) => _.maxBy(v, 'offset')
    ).map((v) => ({
      offset: v ? v.offset : 0,
      partition: v ? v.partition : 0,
    }));

    return _.map(
      _.groupBy(_.concat(partitionUniqs, messageUniqs), 'partition'),
      (v) => _.maxBy(v, 'offset') as FilterProps
    );
  }, [messages, partitions]);

  const getSeekToValuesForPartitions = (partition: any) => {
    const foundedValues = filterProps.find(
      (prop) => prop.partition === partition.value
    );
    if (selectedSeekType === SeekTypes.OFFSET) {
      return foundedValues ? foundedValues.offset : 0;
    }
    return searchTimestamp ? searchTimestamp.getTime() : null;
  };

  React.useEffect(() => {
    fetchTopicMessages(clusterName, topicName, queryParams);
  }, [fetchTopicMessages, clusterName, topicName, queryParams]);

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
          seekType: SeekTypes.TIMESTAMP,
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
      seekType: SeekTypes.OFFSET,
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

  const getTimestampDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'MM.dd.yyyy HH:mm:ss');
  };

  const getMessageContentHeaders = React.useMemo(() => {
    const message = messages[0];
    const headers: JSX.Element[] = [];
    try {
      const content =
        typeof message.content !== 'object'
          ? JSON.parse(message.content)
          : message.content;
      Object.keys(content).forEach((k) =>
        headers.push(<th key={Math.random()}>{`content.${k}`}</th>)
      );
    } catch (e) {
      headers.push(<th>Content</th>);
    }
    return headers;
  }, [messages]);

  const getMessageContentBody = (content: any) => {
    const columns: JSX.Element[] = [];
    try {
      const c = typeof content !== 'object' ? JSON.parse(content) : content;
      Object.values(c).map((v) =>
        columns.push(<td key={Math.random()}>{JSON.stringify(v)}</td>)
      );
    } catch (e) {
      columns.push(<td>{content}</td>);
    }
    return columns;
  };

  const onNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const seekTo: string[] = filterProps
      .filter(
        (value) =>
          selectedPartitions.findIndex((p) => p.value === value.partition) > -1
      )
      .map((p) => `${p.partition}::${p.offset}`);

    setQueryParams({
      ...queryParams,
      seekType: SeekTypes.OFFSET,
      seekTo,
    });
  };

  const filterOptions = (options: Option[], filter: any) => {
    if (!filter) {
      return options;
    }
    return options.filter(
      ({ value }) => value.toString() && value.toString() === filter
    );
  };

  const getTopicMessagesTable = () => {
    return messages.length > 0 ? (
      <div>
        <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Offset</th>
              <th>Partition</th>
              {getMessageContentHeaders}
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={`${message.timestamp}${Math.random()}`}>
                <td>{getTimestampDate(message.timestamp)}</td>
                <td>{message.offset}</td>
                <td>{message.partition}</td>
                {getMessageContentBody(message.content)}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="columns">
          <div className="column is-full">
            <CustomParamButton
              className="is-link is-pulled-right"
              type={CustomParamButtonType.chevronRight}
              onClick={onNext}
              btnText="Next"
            />
          </div>
        </div>
      </div>
    ) : (
      <div>No messages at selected topic</div>
    );
  };

  if (!isFetched) {
    return <PageLoader isFullHeight={false} />;
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
              defaultValue={SeekTypes.OFFSET}
              value={selectedSeekType}
            >
              <option value={SeekTypes.OFFSET}>Offset</option>
              <option value={SeekTypes.TIMESTAMP}>Timestamp</option>
            </select>
          </div>
        </div>
        <div className="column is-one-fifth">
          {selectedSeekType === SeekTypes.OFFSET ? (
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
                onChange={(date) => setSearchTimestamp(date)}
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
      {getTopicMessagesTable()}
    </div>
  );
};

export default Messages;
