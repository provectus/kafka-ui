import 'react-datepicker/dist/react-datepicker.css';

import {
  MessageFilterType,
  Partition,
  PollingMode,
  SeekDirection,
  SeekType,
  SerdeUsage,
  TopicMessage,
  TopicMessageConsuming,
  TopicMessageEvent,
  TopicMessageEventTypeEnum,
  TopicMessageNextPageCursor,
} from 'generated-sources';
import React, { useContext } from 'react';
import omitBy from 'lodash/omitBy';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import MultiSelect from 'components/common/MultiSelect/MultiSelect.styled';
import { Option } from 'react-multi-select-component';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { BASE_PARAMS } from 'lib/constants';
import Select from 'components/common/Select/Select';
import { Button } from 'components/common/Button/Button';
import Search from 'components/common/Search/Search';
import FilterModal, {
  FilterEdit,
} from 'components/Topics/Topic/Messages/Filters/FilterModal';
import { SeekDirectionOptions } from 'components/Topics/Topic/Messages/Messages';
import TopicMessagesContext from 'components/contexts/TopicMessagesContext';
import useBoolean from 'lib/hooks/useBoolean';
import { RouteParamsClusterTopic } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import PlusIcon from 'components/common/Icons/PlusIcon';
import EditIcon from 'components/common/Icons/EditIcon';
import CloseIcon from 'components/common/Icons/CloseIcon';
import ClockIcon from 'components/common/Icons/ClockIcon';
import ArrowDownIcon from 'components/common/Icons/ArrowDownIcon';
import FileIcon from 'components/common/Icons/FileIcon';
import { useRegisterFilter, useTopicDetails } from 'lib/hooks/api/topics';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { getSerdeOptions } from 'components/Topics/Topic/SendMessage/utils';
import { useSerdes } from 'lib/hooks/api/topicMessages';
import { getTopicMessgesLastLoadedPage } from 'redux/reducers/topicMessages/selectors';
import { useAppSelector } from 'lib/hooks/redux';
import { showAlert } from 'lib/errorHandling';

import { getDefaultSerdeName } from './getDefaultSerdeName';
import {
  filterOptions,
  getOffsetFromSeekToParam,
  getSelectedPartitionsFromSeekToParam,
  getTimestampFromSeekToParam,
} from './utils';
import * as S from './Filters.styled';

type Query = Record<string, string | string[] | number>;

export interface FiltersProps {
  phaseMessage?: string;
  meta: TopicMessageConsuming;
  isFetching: boolean;
  messageEventType?: string;
  cursor?: TopicMessageNextPageCursor;
  currentPage: number;
  addMessage(content: { message: TopicMessage; prepend: boolean }): void;
  resetMessages(): void;
  updatePhase(phase: string): void;
  updateMeta(meta: TopicMessageConsuming): void;
  setIsFetching(status: boolean): void;
  setMessageType(messageType: string): void;
  updateCursor(cursor?: TopicMessageNextPageCursor): void;
  setCurrentPage(page: number): void;
  setLastLoadedPage(page: number): void;
  resetAllMessages(): void;
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
  meta: { elapsedMs, bytesConsumed, messagesConsumed, filterApplyErrors },
  isFetching,
  currentPage,
  addMessage,
  resetMessages,
  updatePhase,
  updateMeta,
  setIsFetching,
  setMessageType,
  messageEventType,
  updateCursor,
  setCurrentPage,
  setLastLoadedPage,
  resetAllMessages,
}) => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: topic } = useTopicDetails({ clusterName, topicName });

  const registerFilter = useRegisterFilter({ clusterName, topicName });

  const lastLoadedPage = useAppSelector(getTopicMessgesLastLoadedPage);

  const partitions = topic?.partitions || [];

  const { seekDirection, isLive, changeSeekDirection, page, setPage } =
    useContext(TopicMessagesContext);

  const { value: isOpen, toggle } = useBoolean();

  const { value: isQuickEditOpen, toggle: toggleQuickEdit } = useBoolean();

  const source = React.useRef<EventSource | null>(null);

  const [selectedPartitions, setSelectedPartitions] = React.useState<Option[]>(
    getSelectedPartitionsFromSeekToParam(searchParams, partitions)
  );

  const [currentSeekType, setCurrentSeekType] = React.useState<SeekType>(
    SeekTypeOptions.find(
      (ele) => ele.value === (searchParams.get('seekType') as SeekType)
    ) !== undefined
      ? (searchParams.get('seekType') as SeekType)
      : SeekType.OFFSET
  );
  const [offset, setOffset] = React.useState<string>(
    getOffsetFromSeekToParam(searchParams)
  );

  const [timestamp, setTimestamp] = React.useState<Date | null>(
    getTimestampFromSeekToParam(searchParams)
  );

  const { data: serdes = {} } = useSerdes({
    clusterName,
    topicName,
    use: SerdeUsage.DESERIALIZE,
  });

  const [keySerde, setKeySerde] = React.useState<string>(
    searchParams.get('keySerde') || getDefaultSerdeName(serdes.key || [])
  );
  const [valueSerde, setValueSerde] = React.useState<string>(
    searchParams.get('valueSerde') || getDefaultSerdeName(serdes.value || [])
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
  const [stringFilter, setStringFilter] = React.useState<string>('');
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

  const handleClearAllFilters = () => {
    setCurrentSeekType(SeekType.OFFSET);
    setOffset('');
    setTimestamp(null);
    setStringFilter('');
    setPage(1);
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

  const getPollingMode = (): PollingMode => {
    if (seekDirection === SeekDirection.FORWARD) {
      if (offset && currentSeekType === SeekType.OFFSET)
        return PollingMode.FROM_OFFSET;
      if (timestamp && currentSeekType === SeekType.TIMESTAMP)
        return PollingMode.FROM_TIMESTAMP;
      return PollingMode.EARLIEST;
    }
    if (seekDirection === SeekDirection.BACKWARD) {
      if (offset && currentSeekType === SeekType.OFFSET)
        return PollingMode.TO_OFFSET;
      if (timestamp && currentSeekType === SeekType.TIMESTAMP)
        return PollingMode.TO_TIMESTAMP;
      return PollingMode.LATEST;
    }
    if (seekDirection === SeekDirection.TAILING) return PollingMode.TAILING;
    return PollingMode.LATEST;
  };

  const getSmartFilterId = async (code: string) => {
    try {
      const filterId = await registerFilter.mutateAsync({
        filterCode: code,
      });
      return filterId;
    } catch (e) {
      showAlert('error', {
        message: 'Error occured while registering smart filter',
      });
      return '';
    }
  };

  const handleFiltersSubmit = async (cursor?: TopicMessageNextPageCursor) => {
    if (!keySerde || !valueSerde) return;
    const props: Query = {
      mode: getPollingMode(),
      limit: PER_PAGE,
      stringFilter,
      offset,
      timestamp: timestamp?.getTime() || 0,
      keySerde: keySerde || searchParams.get('keySerde') || '',
      valueSerde: valueSerde || searchParams.get('valueSerde') || '',
    };

    if(props.mode === PollingMode.TAILING) 
      setIsTailing(true);

    if (cursor?.id) props.cursor = cursor?.id;

    if (selectedPartitions.length !== partitions.length) {
      props.partitions = selectedPartitions.map((p) => p.value);
    }

    if (queryType === MessageFilterType.GROOVY_SCRIPT) {
      props.smartFilterId =
        (await getSmartFilterId(activeFilter.code))?.id || '';
    }

    const newProps = omitBy(props, (v) => v === undefined || v === '');
    const qs = Object.keys(newProps)
      .map((key) => `${key}=${encodeURIComponent(newProps[key] as string)}`)
      .join('&');
    navigate({
      search: `?${qs}`,
    });
  };

  const handleSubmit = async () => {
    setPage(1);
    resetAllMessages();
    handleFiltersSubmit();
  };

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

  const composeMessageFilter = (filter: FilterEdit): ActiveMessageFilter => ({
    index: filter.index,
    name: filter.filter.name,
    code: filter.filter.code,
  });

  const storeAsActiveFilter = (filter: FilterEdit) => {
    const messageFilter = JSON.stringify(composeMessageFilter(filter));
    localStorage.setItem('activeFilter', messageFilter);
  };

  const editSavedFilter = (filter: FilterEdit) => {
    const filters = [...savedFilters];
    filters[filter.index] = filter.filter;
    if (activeFilter.name && activeFilter.index === filter.index) {
      setActiveFilter(composeMessageFilter(filter));
      storeAsActiveFilter(filter);
    }
    localStorage.setItem('savedFilters', JSON.stringify(filters));
    setSavedFilters(filters);
  };

  const editCurrentFilter = (filter: FilterEdit) => {
    if (filter.index < 0) {
      setActiveFilter(composeMessageFilter(filter));
      storeAsActiveFilter(filter);
    } else {
      editSavedFilter(filter);
    }
  };
  // eslint-disable-next-line consistent-return
  React.useEffect(() => {
    if (location.search?.length !== 0) {
      if (page === currentPage) return () => {};
      if (page <= lastLoadedPage) {
        setCurrentPage(page);
        return () => {};
      }

      const url = `${BASE_PARAMS.basePath}/api/clusters/${encodeURIComponent(
        clusterName
      )}/topics/${topicName}/messages/v2${location.search}`;
      const sse = new EventSource(url);

      source.current = sse;
      setIsFetching(true);

      sse.onopen = () => {
        resetMessages();
        setIsFetching(true);
      };
      sse.onmessage = ({ data }) => {
        const { type, message, phase, consuming, cursor }: TopicMessageEvent =
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
          case TopicMessageEventTypeEnum.DONE:
            if (consuming && type) {
              setMessageType(type);
              updateMeta(consuming);
              updateCursor(cursor);
              setCurrentPage(page);
              setLastLoadedPage(page);
              handleFiltersSubmit(cursor);
            }
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
    updateCursor,
    setLastLoadedPage,
  ]);

  React.useEffect(() => {
    if (location.search?.length === 0) {
      setPage(1);
      resetAllMessages();
      handleFiltersSubmit();
    }
  }, [
    seekDirection,
    queryType,
    activeFilter,
    currentSeekType,
    timestamp,
    stringFilter,
    location,
  ]);

  React.useEffect(() => {
    setPage(1);
    resetAllMessages();
    handleFiltersSubmit();
  }, [
    seekDirection,
    queryType,
    currentSeekType,
    seekDirection,
    keySerde,
    valueSerde,
  ]);

  React.useEffect(() => {
    setPage(1);
    resetAllMessages();
  }, [selectedPartitions, offset, timestamp, stringFilter, activeFilter]);

  React.useEffect(() => {
    setIsTailing(isLive);
  }, [isLive]);

  return (
    <S.FiltersWrapper>
      <div>
        <S.FilterInputs>
          <div>
            <InputLabel>Seek Type</InputLabel>
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
                  dateFormat="MMM d, yyyy HH:mm"
                  placeholderText="Select timestamp"
                  disabled={isTailing}
                />
              )}
            </S.SeekTypeSelectorWrapper>
          </div>
          <div>
            <InputLabel>Partitions</InputLabel>
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
          </div>
          <div>
            <InputLabel>Key Serde</InputLabel>
            <Select
              id="selectKeySerdeOptions"
              aria-labelledby="selectKeySerdeOptions"
              onChange={(option) => setKeySerde(option as string)}
              minWidth="170px"
              options={getSerdeOptions(serdes.key || [])}
              value={searchParams.get('keySerde') as string}
              selectSize="M"
              disabled={isTailing}
            />
          </div>
          <div>
            <InputLabel>Value Serde</InputLabel>
            <Select
              id="selectValueSerdeOptions"
              aria-labelledby="selectValueSerdeOptions"
              onChange={(option) => setValueSerde(option as string)}
              options={getSerdeOptions(serdes.value || [])}
              value={searchParams.get('valueSerde') as string}
              minWidth="170px"
              selectSize="M"
              disabled={isTailing}
            />
          </div>
          <S.ClearAll onClick={handleClearAllFilters}>Clear all</S.ClearAll>
          <Button
            type="submit"
            buttonType="secondary"
            buttonSize="M"
            disabled={isSubmitDisabled}
            onClick={() => (isFetching ? handleSSECancel() : handleSubmit())}
            style={{ fontWeight: 500 }}
          >
            {isFetching ? 'Cancel' : 'Submit'}
          </Button>
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
        <Search
          placeholder="Search"
          disabled={isTailing}
          onChange={setStringFilter}
        />

        <Button buttonType="secondary" buttonSize="M" onClick={toggle}>
          <PlusIcon />
          Add Filters
        </Button>
        {activeFilter.name && (
          <S.ActiveSmartFilter data-testid="activeSmartFilter">
            <S.SmartFilterName>{activeFilter.name}</S.SmartFilterName>
            <S.EditSmartFilterIcon
              data-testid="editActiveSmartFilterBtn"
              onClick={toggleQuickEdit}
            >
              <EditIcon />
            </S.EditSmartFilterIcon>
            <S.DeleteSmartFilterIcon onClick={deleteActiveFilter}>
              <CloseIcon />
            </S.DeleteSmartFilterIcon>
          </S.ActiveSmartFilter>
        )}
      </S.ActiveSmartFilterWrapper>
      {isQuickEditOpen && (
        <FilterModal
          quickEditMode
          activeFilter={activeFilter}
          toggleIsOpen={toggleQuickEdit}
          editSavedFilter={editCurrentFilter}
          filters={[]}
          addFilter={() => null}
          deleteFilter={() => null}
          activeFilterHandler={() => null}
        />
      )}

      {isOpen && (
        <FilterModal
          toggleIsOpen={toggle}
          filters={savedFilters}
          addFilter={addFilter}
          deleteFilter={deleteFilter}
          activeFilterHandler={activeFilterHandler}
          editSavedFilter={editSavedFilter}
          activeFilter={activeFilter}
        />
      )}
      <S.FiltersMetrics>
        <S.Message>
          {seekDirection !== SeekDirection.TAILING &&
            isFetching &&
            phaseMessage}
          {!isFetching && messageEventType}
        </S.Message>
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
        {!!filterApplyErrors && (
          <S.Metric title="Errors">
            <span>{filterApplyErrors} errors</span>
          </S.Metric>
        )}
      </S.FiltersMetrics>
    </S.FiltersWrapper>
  );
};

export default Filters;
