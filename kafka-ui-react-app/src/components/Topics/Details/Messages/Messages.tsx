import React, { useCallback, useEffect, useRef } from 'react';
import {
  ClusterName,
  SeekTypes,
  TopicMessage,
  TopicMessageQueryParams,
  TopicName,
} from 'redux/interfaces';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import CustomParamButton, {
  CustomParamButtonType,
} from 'components/Topics/shared/Form/CustomParams/CustomParamButton';

import { debounce } from 'lodash';

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
  fetchTopicMessages,
}) => {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [searchTimestamp, setSearchTimestamp] = React.useState<Date | null>(
    null
  );
  const [filterProps, setFilterProps] = React.useState<FilterProps[]>([]);
  const [queryParams, setQueryParams] = React.useState<
    Partial<TopicMessageQueryParams>
  >({ limit: 100 });

  const prevSearchTimestamp = usePrevious(searchTimestamp);

  const getUniqueDataForEachPartition: FilterProps[] = React.useMemo(() => {
    const map = messages.map((message) => [
      message.partition,
      {
        partition: message.partition,
        offset: message.offset,
      },
    ]);
    // @ts-ignore
    return [...new Map(map).values()];
  }, [messages]);

  React.useEffect(() => {
    fetchTopicMessages(clusterName, topicName, queryParams);
  }, [fetchTopicMessages, clusterName, topicName, queryParams]);

  React.useEffect(() => {
    setFilterProps(getUniqueDataForEachPartition);
  }, [messages]);

  const handleDelayedQuery = useCallback(
    debounce(
      (query: string) => setQueryParams({ ...queryParams, q: query }),
      1000
    ),
    []
  );
  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;

    setSearchQuery(query);
    handleDelayedQuery(query);
  };

  const handleDateTimeChange = () => {
    if (searchTimestamp !== prevSearchTimestamp) {
      if (searchTimestamp) {
        const timestamp: number = searchTimestamp.getTime();

        setSearchTimestamp(searchTimestamp);
        setQueryParams({
          ...queryParams,
          seekType: SeekTypes.TIMESTAMP,
          seekTo: filterProps.map((p) => `${p.partition}::${timestamp}`),
        });
      } else {
        setSearchTimestamp(null);
        const { seekTo, seekType, ...queryParamsWithoutSeek } = queryParams;
        setQueryParams(queryParamsWithoutSeek);
      }
    }
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

    const seekTo: string[] = filterProps.map(
      (p) => `${p.partition}::${p.offset}`
    );
    setQueryParams({
      ...queryParams,
      seekType: SeekTypes.OFFSET,
      seekTo,
    });
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

  return isFetched ? (
    <div>
      <div className="columns">
        <div className="column is-one-quarter">
          <label className="label">Timestamp</label>
          <DatePicker
            selected={searchTimestamp}
            onChange={(date) => setSearchTimestamp(date)}
            onCalendarClose={handleDateTimeChange}
            isClearable
            showTimeInput
            timeInputLabel="Time:"
            dateFormat="MMMM d, yyyy h:mm aa"
            className="input"
          />
        </div>
        <div className="column is-two-quarters is-offset-one-quarter">
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
      <div>{getTopicMessagesTable()}</div>
    </div>
  ) : (
    <PageLoader isFullHeight={false} />
  );
};

export default Messages;
