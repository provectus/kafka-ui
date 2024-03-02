import 'react-datepicker/dist/react-datepicker.css';

import {
  MessageFilterType,
  PollingMode,
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
import {
  BASE_PARAMS,
  PollingModeOptions,
  PollingModeOptionsObj,
} from 'lib/constants';
import { SelectOption } from 'components/common/Select/Select';
import { Button } from 'components/common/Button/Button';
import Search from 'components/common/Search/Search';
import FilterModal, {
  FilterEdit,
} from 'components/Topics/Topic/Messages/Filters/FilterModal';
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
import { getTopicMessgesLastLoadedPage } from 'redux/reducers/topicMessages/selectors';
import { useAppSelector } from 'lib/hooks/redux';
import { showAlert } from 'lib/errorHandling';
import RefreshIcon from 'components/common/Icons/RefreshIcon';
import Input from 'components/common/Input/Input';
import DatePicker from 'components/common/DatePicker/DatePicker';
import { SelectSubFormProps } from 'components/common/Select/SelectSubForm';

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

  const {
    pollingMode,
    isLive,
    changePollingMode,
    page,
    setPage,
    keySerde,
    valueSerde,
  } = useContext(TopicMessagesContext);

  const { value: isOpen, toggle } = useBoolean();

  const { value: isQuickEditOpen, toggle: toggleQuickEdit } = useBoolean();

  const source = React.useRef<EventSource | null>(null);

  const [selectedPartitions, setSelectedPartitions] = React.useState<Option[]>(
    getSelectedPartitionsFromSeekToParam(searchParams, partitions)
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
  const [stringFilter, setStringFilter] = React.useState<string>('');
  const [isTailing, setIsTailing] = React.useState<boolean>(isLive);

  const isPollingModeControlVisible = React.useMemo(
    () => selectedPartitions.length > 0,
    [selectedPartitions]
  );

  const isSubmitDisabled = React.useMemo(() => {
    if (isPollingModeControlVisible) {
      return (
        ((pollingMode === PollingMode.FROM_TIMESTAMP ||
          pollingMode === PollingMode.TO_TIMESTAMP) &&
          !timestamp) ||
        isTailing
      );
    }

    return false;
  }, [isPollingModeControlVisible, pollingMode, timestamp, isTailing]);

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
      mode: pollingMode,
      limit: PER_PAGE,
      stringFilter,
      offset,
      timestamp: timestamp?.getTime() || 0,
      keySerde: keySerde || searchParams.get('keySerde') || '',
      valueSerde: valueSerde || searchParams.get('valueSerde') || '',
    };

    if (props.mode === PollingMode.TAILING) setIsTailing(true);

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

  const handlePollingModeSelect = (
    pollingModeVal: PollingMode,
    value?: string | Date | null
  ) => {
    changePollingMode(pollingModeVal);
    if (
      (pollingModeVal === PollingMode.FROM_OFFSET ||
        pollingModeVal === PollingMode.TO_OFFSET) &&
      value
    ) {
      setOffset(value as string);
    }
    if (
      (pollingModeVal === PollingMode.FROM_TIMESTAMP ||
        pollingModeVal === PollingMode.TO_TIMESTAMP) &&
      value
    ) {
      setTimestamp(value as Date | null);
    }
    // setPage(1);
    // resetAllMessages();
    // handleFiltersSubmit();
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
    pollingMode,
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
  }, [queryType, activeFilter, pollingMode, timestamp, stringFilter, location]);

  React.useEffect(() => {
    setPage(1);
    resetAllMessages();
    handleFiltersSubmit();
  }, [pollingMode, queryType, keySerde, valueSerde]);

  React.useEffect(() => {
    setPage(1);
    resetAllMessages();
  }, [selectedPartitions, stringFilter, activeFilter]);

  React.useEffect(() => {
    setIsTailing(isLive);
  }, [isLive]);

  const formatElapsedTime = (elapsedTimeMs: number): string => {
    let timeMs = elapsedTimeMs;
    // Convert milliseconds to hours, minutes, and seconds
    const hours = Math.floor(timeMs / 3600000);

    // Format the time components into a string
    if (hours > 0) {
      return `${hours}h `;
    }
    timeMs %= 3600000;
    const minutes = Math.floor(timeMs / 60000);
    if (minutes > 0 || hours > 0) {
      return `${minutes}m `;
    }
    timeMs %= 60000;
    const seconds = Math.floor(timeMs / 1000);
    if (seconds > 0 || minutes > 0 || hours > 0) {
      return `${seconds}s `;
    }
    timeMs %= 1000;
    return `${timeMs}ms`;
  };

  const pollingModeOptions: SelectOption[] = PollingModeOptions.map(
    (option) => {
      let subFormProps: SelectSubFormProps | undefined;
      if (
        option === PollingModeOptionsObj.TO_OFFSET ||
        option === PollingModeOptionsObj.FROM_OFFSET
      )
        subFormProps = {
          inputType: Input,
          inputProps: {
            id: 'offset',
            type: 'text',
            label: 'Offset',
            inputSize: 'M',
            placeholder: '',
            integerOnly: true,
            positiveOnly: true,
          },
        };
      if (
        option === PollingModeOptionsObj.TO_TIMESTAMP ||
        option === PollingModeOptionsObj.FROM_TIMESTAMP
      )
        subFormProps = {
          inputType: DatePicker,
          inputProps: {
            showTimeInput: true,
            timeInputLabel: 'Time:',
            dateFormat: 'MMM d, yyyy HH:mm',
            placeholderText: 'Select timestamp',
            inline: true,
            maxDate: new Date(Date.now()),
          },
        };

      return {
        ...option,
        subFormProps,
      };
    }
  );

  // const [pollingModeOptions, setPollingModeOptions] = React.useState<SelectOption[]>(getPollingModeOptions());

  return (
    <S.FiltersWrapper>
      <div>
        <S.FilterInputs>
          <div>
            <S.PollingModeSelectorWrapper>
              <S.PollingModeSelect
                id="selectPollingMode"
                onChange={(option, value) =>
                  handlePollingModeSelect(option as PollingMode, value)
                }
                value={pollingMode}
                selectSize="M"
                minWidth="128px"
                optionsMaxHeight="400px"
                options={pollingModeOptions}
                disabled={isTailing}
                isLive={isLive}
              />

              {(pollingMode === PollingMode.FROM_OFFSET ||
                pollingMode === PollingMode.TO_OFFSET) && (
                <S.OffsetSelector
                  id="offset"
                  type="text"
                  inputSize="M"
                  value={offset}
                  placeholder="Offset"
                  onChange={({ target: { value } }) => setOffset(value)}
                  disabled={isTailing}
                />
              )}
              {(pollingMode === PollingMode.FROM_TIMESTAMP ||
                pollingMode === PollingMode.TO_TIMESTAMP) && (
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
            </S.PollingModeSelectorWrapper>
          </div>
          <div>
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
          <S.RefreshIconContainer
            type="submit"
            disabled={isSubmitDisabled}
            onClick={() => (isFetching ? handleSSECancel() : handleSubmit())}
          >
            <RefreshIcon />
          </S.RefreshIconContainer>
        </S.FilterInputs>
        <Search
          placeholder="Search"
          disabled={isTailing}
          onChange={setStringFilter}
        />
      </div>
      <div style={{ display: 'flex' }}>
        <S.ActiveSmartFilterWrapper>
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
        <S.FiltersMetrics>
          <S.Message>
            {pollingMode !== PollingMode.TAILING && isFetching && phaseMessage}
            {!isFetching && messageEventType}
          </S.Message>
          <S.MessageLoading isLive={isTailing}>
            <S.MessageLoadingSpinner isFetching={isFetching} />
            Loading
            <S.StopLoading
              onClick={() => {
                handleSSECancel();
                setIsTailing(false);
              }}
            >
              Stop
            </S.StopLoading>
          </S.MessageLoading>
          <S.Metric title="Elapsed Time">
            <S.MetricsIcon>
              <ClockIcon />
            </S.MetricsIcon>
            <span>{formatElapsedTime(Math.max(elapsedMs || 0, 0))}</span>
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
            <span>{messagesConsumed} messages</span>
          </S.Metric>
          {!!filterApplyErrors && (
            <S.Metric title="Errors">
              <span>{filterApplyErrors} errors</span>
            </S.Metric>
          )}
        </S.FiltersMetrics>
      </div>

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
    </S.FiltersWrapper>
  );
};

export default Filters;
