import 'react-datepicker/dist/react-datepicker.css';

import {
  MessageFilterType,
  Partition,
  SeekDirection,
  SeekType,
  TopicMessage,
  TopicMessageConsuming,
  TopicMessageEvent,
  TopicMessageEventTypeEnum,
} from 'generated-sources';
import React, { useContext } from 'react';
import { omitBy } from 'lodash';
import { useNavigate, useLocation } from 'react-router-dom';
import MultiSelect from 'components/common/MultiSelect/MultiSelect.styled';
import { Option } from 'react-multi-select-component/dist/lib/interfaces';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { BASE_PARAMS } from 'lib/constants';
import Select from 'components/common/Select/Select';
import { Button } from 'components/common/Button/Button';
import Search from 'components/common/Search/Search';
import FilterModal, {
  FilterEdit,
} from 'components/Topics/Topic/Details/Messages/Filters/FilterModal';
import { SeekDirectionOptions } from 'components/Topics/Topic/Details/Messages/Messages';
import TopicMessagesContext from 'components/contexts/TopicMessagesContext';
import useModal from 'lib/hooks/useModal';
import { getPartitionsByTopicName } from 'redux/reducers/topics/selectors';
import { useAppSelector } from 'lib/hooks/redux';
import { RouteParamsClusterTopic } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';

import * as S from './Filters.styled';
import {
  filterOptions,
  getOffsetFromSeekToParam,
  getSelectedPartitionsFromSeekToParam,
  getTimestampFromSeekToParam,
} from './utils';

type Query = Record<string, string | string[] | number>;

export interface FiltersProps {
  phaseMessage?: string;
  meta: TopicMessageConsuming;
  isFetching: boolean;
  addMessage(content: { message: TopicMessage; prepend: boolean }): void;
  resetMessages(): void;
  updatePhase(phase: string): void;
  updateMeta(meta: TopicMessageConsuming): void;
  setIsFetching(status: boolean): void;
}

export interface MessageFilters {
  name: string;
  code: string;
}

export interface ActiveMessageFilter {
  index: number;
  name: string;
  code: string;
}

const PER_PAGE = 100;

export const SeekTypeOptions = [
  { value: SeekType.OFFSET, label: 'Offset' },
  { value: SeekType.TIMESTAMP, label: 'Timestamp' },
];

const Filters: React.FC<FiltersProps> = ({
  phaseMessage,
  meta: { elapsedMs, bytesConsumed, messagesConsumed },
  isFetching,
  addMessage,
  resetMessages,
  updatePhase,
  updateMeta,
  setIsFetching,
}) => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();
  const location = useLocation();
  const navigate = useNavigate();

  const partitions = useAppSelector((state) =>
    getPartitionsByTopicName(state, topicName)
  );

  const { searchParams, seekDirection, isLive, changeSeekDirection } =
    useContext(TopicMessagesContext);

  const { isOpen, toggle } = useModal();

  const source = React.useRef<EventSource | null>(null);

  const [selectedPartitions, setSelectedPartitions] = React.useState<Option[]>(
    getSelectedPartitionsFromSeekToParam(searchParams, partitions)
  );

  const [attempt, setAttempt] = React.useState(0);
  const [currentSeekType, setCurrentSeekType] = React.useState<SeekType>(
    (searchParams.get('seekType') as SeekType) || SeekType.OFFSET
  );
  const [offset, setOffset] = React.useState<string>(
    getOffsetFromSeekToParam(searchParams)
  );

  const [timestamp, setTimestamp] = React.useState<Date | null>(
    getTimestampFromSeekToParam(searchParams)
  );

  const [savedFilters, setSavedFilters] = React.useState<MessageFilters[]>(
    JSON.parse(localStorage.getItem('savedFilters') ?? '[]')
  );

  let storageActiveFilter = localStorage.getItem('activeFilter');
  storageActiveFilter =
    storageActiveFilter ?? JSON.stringify({ name: '', code: '', index: -1 });

  const [activeFilter, setActiveFilter] = React.useState<ActiveMessageFilter>(
    JSON.parse(storageActiveFilter)
  );

  const [queryType, setQueryType] = React.useState<MessageFilterType>(
    activeFilter.name
      ? MessageFilterType.GROOVY_SCRIPT
      : MessageFilterType.STRING_CONTAINS
  );
  const [query, setQuery] = React.useState<string>(searchParams.get('q') || '');
  const [isTailing, setIsTailing] = React.useState<boolean>(isLive);

  const isSeekTypeControlVisible = React.useMemo(
    () => selectedPartitions.length > 0,
    [selectedPartitions]
  );

  const isSubmitDisabled = React.useMemo(() => {
    if (isSeekTypeControlVisible) {
      return (
        (currentSeekType === SeekType.TIMESTAMP && !timestamp) || isTailing
      );
    }

    return false;
  }, [isSeekTypeControlVisible, currentSeekType, timestamp, isTailing]);

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

  const props: Query = React.useMemo(() => {
    return {
      q:
        queryType === MessageFilterType.GROOVY_SCRIPT
          ? activeFilter.code
          : query,
      filterQueryType: queryType,
      attempt,
      limit: PER_PAGE,
      seekDirection,
    };
  }, [attempt, query, queryType, seekDirection, activeFilter]);

  const handleClearAllFilters = () => {
    setCurrentSeekType(SeekType.OFFSET);
    setOffset('');
    setQuery('');
    changeSeekDirection(SeekDirection.FORWARD);
    getSelectedPartitionsFromSeekToParam(searchParams, partitions);
    setSelectedPartitions(
      partitions.map((partition: Partition) => {
        return {
          value: partition.partition,
          label: `Partition #${partition.partition.toString()}`,
        };
      })
    );
  };

  const handleFiltersSubmit = React.useCallback(
    (currentOffset: string) => {
      setAttempt(attempt + 1);

      if (isSeekTypeControlVisible) {
        props.seekType = isLive ? SeekType.LATEST : currentSeekType;
        props.seekTo = selectedPartitions.map(({ value }) => {
          const offsetProperty =
            seekDirection === SeekDirection.FORWARD ? 'offsetMin' : 'offsetMax';
          const offsetBasedSeekTo =
            currentOffset || partitionMap[value][offsetProperty];
          const seekToOffset =
            currentSeekType === SeekType.OFFSET
              ? offsetBasedSeekTo
              : timestamp?.getTime();

          return `${value}::${seekToOffset || '0'}`;
        });
      }

      const newProps = omitBy(props, (v) => v === undefined || v === '');
      const qs = Object.keys(newProps)
        .map((key) => `${key}=${newProps[key]}`)
        .join('&');

      navigate({
        search: `?${qs}`,
      });
    },
    [
      seekDirection,
      queryType,
      activeFilter,
      currentSeekType,
      timestamp,
      query,
      selectedPartitions,
      navigate,
    ]
  );

  const handleSSECancel = () => {
    if (!source.current) return;
    setIsFetching(false);
    source.current.close();
  };

  const addFilter = (newFilter: MessageFilters) => {
    const filters = [...savedFilters];
    filters.push(newFilter);
    setSavedFilters(filters);
    localStorage.setItem('savedFilters', JSON.stringify(filters));
  };
  const deleteFilter = (index: number) => {
    const filters = [...savedFilters];
    if (activeFilter.name && activeFilter.index === index) {
      localStorage.removeItem('activeFilter');
      setActiveFilter({ name: '', code: '', index: -1 });
      setQueryType(MessageFilterType.STRING_CONTAINS);
    }
    filters.splice(index, 1);
    localStorage.setItem('savedFilters', JSON.stringify(filters));
    setSavedFilters(filters);
  };
  const deleteActiveFilter = () => {
    setActiveFilter({ name: '', code: '', index: -1 });
    localStorage.removeItem('activeFilter');
    setQueryType(MessageFilterType.STRING_CONTAINS);
  };
  const activeFilterHandler = (
    newActiveFilter: MessageFilters,
    index: number
  ) => {
    localStorage.setItem(
      'activeFilter',
      JSON.stringify({ index, ...newActiveFilter })
    );
    setActiveFilter({ index, ...newActiveFilter });
    setQueryType(MessageFilterType.GROOVY_SCRIPT);
  };
  const editSavedFilter = (filter: FilterEdit) => {
    const filters = [...savedFilters];
    filters[filter.index] = filter.filter;
    if (activeFilter.name && activeFilter.index === filter.index) {
      setActiveFilter({
        index: filter.index,
        name: filter.filter.name,
        code: filter.filter.code,
      });
      localStorage.setItem(
        'activeFilter',
        JSON.stringify({
          index: filter.index,
          name: filter.filter.name,
          code: filter.filter.code,
        })
      );
    }
    localStorage.setItem('savedFilters', JSON.stringify(filters));
    setSavedFilters(filters);
  };
  // eslint-disable-next-line consistent-return
  React.useEffect(() => {
    if (location.search?.length !== 0) {
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
            if (message) {
              addMessage({
                message,
                prepend: isLive,
              });
            }
            break;
          case TopicMessageEventTypeEnum.PHASE:
            if (phase?.name) {
              updatePhase(phase.name);
            }
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
  }, [
    clusterName,
    topicName,
    seekDirection,
    location,
    addMessage,
    resetMessages,
    setIsFetching,
    updateMeta,
    updatePhase,
  ]);
  React.useEffect(() => {
    if (location.search?.length === 0) {
      handleFiltersSubmit(offset);
    }
  }, [
    seekDirection,
    queryType,
    activeFilter,
    currentSeekType,
    timestamp,
    query,
    location,
  ]);
  React.useEffect(() => {
    handleFiltersSubmit(offset);
  }, [
    seekDirection,
    queryType,
    activeFilter,
    currentSeekType,
    timestamp,
    query,
    seekDirection,
  ]);

  React.useEffect(() => {
    setIsTailing(isLive);
  }, [isLive]);

  return (
    <S.FiltersWrapper>
      <div>
        <S.FilterInputs>
          <Search
            placeholder="Search"
            value={query}
            disabled={isTailing}
            handleSearch={(value: string) => setQuery(value)}
          />
          <S.SeekTypeSelectorWrapper>
            <S.SeekTypeSelect
              id="selectSeekType"
              onChange={(option) => setCurrentSeekType(option as SeekType)}
              value={currentSeekType}
              selectSize="M"
              minWidth="100px"
              options={SeekTypeOptions}
              disabled={isTailing}
            />
            {currentSeekType === SeekType.OFFSET ? (
              <S.OffsetSelector
                id="offset"
                type="text"
                inputSize="M"
                value={offset}
                placeholder="Offset"
                onChange={({ target: { value } }) => setOffset(value)}
                disabled={isTailing}
              />
            ) : (
              <S.DatePickerInput
                selected={timestamp}
                onChange={(date: Date | null) => setTimestamp(date)}
                showTimeInput
                timeInputLabel="Time:"
                dateFormat="MMMM d, yyyy HH:mm"
                placeholderText="Select timestamp"
                disabled={isTailing}
              />
            )}
          </S.SeekTypeSelectorWrapper>
          <MultiSelect
            options={partitions.map((p) => ({
              label: `Partition #${p.partition.toString()}`,
              value: p.partition,
            }))}
            filterOptions={filterOptions}
            value={selectedPartitions}
            onChange={setSelectedPartitions}
            labelledBy="Select partitions"
            disabled={isTailing}
          />
          <S.ClearAll onClick={handleClearAllFilters}>Clear all</S.ClearAll>
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
              onClick={() => handleFiltersSubmit(offset)}
              style={{ fontWeight: 500 }}
            >
              Submit
            </Button>
          )}
        </S.FilterInputs>
        <Select
          selectSize="M"
          onChange={(option) => changeSeekDirection(option as string)}
          value={seekDirection}
          minWidth="120px"
          options={SeekDirectionOptions}
          isLive={isLive}
        />
      </div>
      <S.ActiveSmartFilterWrapper>
        <Button buttonType="primary" buttonSize="M" onClick={toggle}>
          <i className="fas fa-plus fa-sm" />
          Add Filters
        </Button>
        {activeFilter.name && (
          <S.ActiveSmartFilter data-testid="activeSmartFilter">
            {activeFilter.name}
            <S.DeleteSavedFilterIcon onClick={deleteActiveFilter}>
              <i
                className="fas fa-times"
                data-testid="activeSmartFilterCloseIcon"
              />
            </S.DeleteSavedFilterIcon>
          </S.ActiveSmartFilter>
        )}
      </S.ActiveSmartFilterWrapper>
      {isOpen && (
        <FilterModal
          toggleIsOpen={toggle}
          filters={savedFilters}
          addFilter={addFilter}
          deleteFilter={deleteFilter}
          activeFilterHandler={activeFilterHandler}
          editSavedFilter={editSavedFilter}
        />
      )}
      <S.FiltersMetrics>
        <p style={{ fontSize: 14 }}>
          {seekDirection !== SeekDirection.TAILING &&
            isFetching &&
            phaseMessage}
        </p>
        <S.MessageLoading isLive={isTailing}>
          <S.MessageLoadingSpinner isFetching={isFetching} />
          Loading messages.
          <S.StopLoading
            onClick={() => {
              handleSSECancel();
              setIsTailing(false);
            }}
          >
            Stop loading
          </S.StopLoading>
        </S.MessageLoading>
        <S.Metric title="Elapsed Time">
          <S.MetricsIcon>
            <i className="far fa-clock" />
          </S.MetricsIcon>
          <span>{Math.max(elapsedMs || 0, 0)} ms</span>
        </S.Metric>
        <S.Metric title="Bytes Consumed">
          <S.MetricsIcon>
            <i className="fas fa-arrow-down" />
          </S.MetricsIcon>
          <BytesFormatted value={bytesConsumed} />
        </S.Metric>
        <S.Metric title="Messages Consumed">
          <S.MetricsIcon>
            <i className="far fa-file-alt" />
          </S.MetricsIcon>
          <span>{messagesConsumed} messages consumed</span>
        </S.Metric>
      </S.FiltersMetrics>
    </S.FiltersWrapper>
  );
};

export default Filters;
