import 'react-datepicker/dist/react-datepicker.css';

import { AsyncThunk } from '@reduxjs/toolkit';
import { Button } from 'components/common/Button/Button';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import ArrowDownIcon from 'components/common/Icons/ArrowDownIcon';
import ClockIcon from 'components/common/Icons/ClockIcon';
import CloseIcon from 'components/common/Icons/CloseIcon';
import FileIcon from 'components/common/Icons/FileIcon';
import PlusIcon from 'components/common/Icons/PlusIcon';
import MultiSelect from 'components/common/MultiSelect/MultiSelect.styled';
import Search from 'components/common/Search/Search';
import Select from 'components/common/Select/Select';
import TopicMessagesContext from 'components/contexts/TopicMessagesContext';
import { SeekDirectionOptions } from 'components/Topics/Topic/Messages/Messages';
import {
  GetSerdesRequest,
  MessageFilterType,
  Partition,
  SeekDirection,
  SeekType,
  SerdeUsage,
  TopicMessage,
  TopicMessageConsuming,
  TopicMessageEvent,
  TopicMessageEventTypeEnum,
  TopicSerdeSuggestion,
} from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';
import { useTopicDetails } from 'lib/hooks/api/topics';
import useAppParams from 'lib/hooks/useAppParams';
import useModal from 'lib/hooks/useModal';
import { RouteParamsClusterTopic } from 'lib/paths';
import omitBy from 'lodash/omitBy';
import React, { useContext } from 'react';
import { Option } from 'react-multi-select-component/dist/lib/interfaces';
import { useLocation, useNavigate } from 'react-router-dom';
import { TopicName } from 'redux/interfaces';

import FilterModal, { FilterEdit } from './FilterModal';
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
  setTopicSerdes(serdes: TopicSerdeSuggestion): void;
  fetchTopicSerdes: AsyncThunk<
    { topicSerdes: TopicSerdeSuggestion; topicName: TopicName },
    GetSerdesRequest,
    Record<string, unknown>
  >;
  serdes: TopicSerdeSuggestion;
}

export interface MessageFilters {
  name: string;
  code: string;
}

interface ActiveMessageFilter {
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
  setTopicSerdes,
  fetchTopicSerdes,
  serdes,
}) => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: topic } = useTopicDetails({ clusterName, topicName });

  const partitions = topic?.partitions || [];

  const { searchParams, seekDirection, isLive, changeSeekDirection } =
    useContext(TopicMessagesContext);

  const { isOpen, toggle } = useModal();

  const source = React.useRef<EventSource | null>(null);

  const [selectedPartitions, setSelectedPartitions] = React.useState<Option[]>(
    getSelectedPartitionsFromSeekToParam(searchParams, partitions)
  );

  const [attempt, setAttempt] = React.useState(0);

  const [serdeOptions, setSerdeOptions] =
    React.useState<TopicSerdeSuggestion>();
  const [selectedSerdeKey, setSelectedSerdeKey] = React.useState('');
  const [selectedSerdeValue, setSelectedSerdeValue] = React.useState('');
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
      keySerde: selectedSerdeKey,
      valueSerde: selectedSerdeValue,
    };
  }, [
    attempt,
    query,
    queryType,
    seekDirection,
    activeFilter,
    selectedSerdeKey,
    selectedSerdeValue,
  ]);

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
        switch (seekDirection) {
          case SeekDirection.FORWARD:
            props.seekType = SeekType.BEGINNING;
            break;
          case SeekDirection.BACKWARD:
          case SeekDirection.TAILING:
            props.seekType = SeekType.LATEST;
            break;
          default:
            props.seekType = currentSeekType;
        }
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
        .map((key) => `${key}=${encodeURIComponent(newProps[key] as string)}`)
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
      selectedSerdeKey,
      selectedSerdeValue,
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

  React.useEffect(() => {
    if (serdes.key && serdes.value) {
      setSerdeOptions(serdes);

      const preferredKeySerde = serdes.key.find((k) => k.preferred);
      const preferredValueSerde = serdes.value.find((v) => v.preferred);

      if (preferredKeySerde?.name) {
        setSelectedSerdeKey(preferredKeySerde.name);
      }

      if (preferredValueSerde?.name) {
        setSelectedSerdeValue(preferredValueSerde.name);
      }
    }
  }, [serdes]);

  React.useEffect(() => {
    const init = async () => {
      const topSerdesAction = await fetchTopicSerdes({
        topicName,
        clusterName,
        use: SerdeUsage.SERIALIZE,
      });
      setTopicSerdes(topSerdesAction);
    };

    init();
  }, [fetchTopicSerdes, topicName, clusterName]);

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
    selectedSerdeKey,
    selectedSerdeValue,
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
    selectedSerdeKey,
    selectedSerdeValue,
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
    selectedSerdeKey,
    selectedSerdeValue,
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

          <Select
            selectSize="M"
            onChange={(newValue) => setSelectedSerdeValue(newValue as string)}
            value={selectedSerdeValue}
            minWidth="120px"
            options={
              serdeOptions && Array.isArray(serdeOptions.value)
                ? serdeOptions.value.map((valueItem) => ({
                    label: valueItem.name || '',
                    value: valueItem.name || '',
                  }))
                : []
            }
          />

          <Select
            selectSize="M"
            onChange={(newKey) => setSelectedSerdeKey(newKey as string)}
            value={selectedSerdeKey}
            minWidth="120px"
            options={
              serdeOptions && Array.isArray(serdeOptions.key)
                ? serdeOptions.key.map((keyItem) => ({
                    label: keyItem.name || '',
                    value: keyItem.name || '',
                  }))
                : []
            }
          />

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
          <PlusIcon />
          Add Filters
        </Button>
        {activeFilter.name && (
          <S.ActiveSmartFilter data-testid="activeSmartFilter">
            {activeFilter.name}
            <S.DeleteSavedFilterIcon onClick={deleteActiveFilter}>
              <CloseIcon />
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
            <ClockIcon />
          </S.MetricsIcon>
          <span>{Math.max(elapsedMs || 0, 0)} ms</span>
        </S.Metric>
        <S.Metric title="Bytes Consumed">
          <S.MetricsIcon>
            <ArrowDownIcon />
          </S.MetricsIcon>
          <BytesFormatted value={bytesConsumed} />
        </S.Metric>
        <S.Metric title="Messages Consumed">
          <S.MetricsIcon>
            <FileIcon />
          </S.MetricsIcon>
          <span>{messagesConsumed} messages consumed</span>
        </S.Metric>
      </S.FiltersMetrics>
    </S.FiltersWrapper>
  );
};

export default Filters;
