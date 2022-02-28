import 'react-datepicker/dist/react-datepicker.css';

import {
  Partition,
  SeekDirection,
  SeekType,
  TopicMessage,
  TopicMessageConsuming,
  TopicMessageEvent,
  TopicMessageEventTypeEnum,
  MessageFilterType,
} from 'generated-sources';
import * as React from 'react';
import { omitBy } from 'lodash';
import { useHistory, useLocation } from 'react-router';
import DatePicker from 'react-datepicker';
import MultiSelect from 'components/common/MultiSelect/MultiSelect.styled';
import { Option } from 'react-multi-select-component/dist/lib/interfaces';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { TopicName, ClusterName } from 'redux/interfaces';
import { BASE_PARAMS } from 'lib/constants';
import Input from 'components/common/Input/Input';
import Select from 'components/common/Select/Select';
import { Button } from 'components/common/Button/Button';
import FilterModal, {
  FilterEdit,
} from 'components/Topics/Topic/Details/Messages/Filters/FilterModal';

import * as S from './Filters.styled';
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

const SeekTypeOptions = [
  { value: SeekType.OFFSET, label: 'Offset' },
  { value: SeekType.TIMESTAMP, label: 'Timestamp' },
];
const SeekDirectionOptions = [
  { value: SeekDirection.FORWARD, label: 'Oldest First' },
  { value: SeekDirection.BACKWARD, label: 'Newest First' },
];

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

  const [isOpen, setIsOpen] = React.useState(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);

  const source = React.useRef<EventSource | null>(null);

  const searchParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location]
  );

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
  const [activeFilter, setActiveFilter] = React.useState<
    ActiveMessageFilter | boolean
  >(JSON.parse(localStorage.getItem('activeFilter') ?? 'false'));

  const [queryType, setQueryType] = React.useState<MessageFilterType>(
    activeFilter
      ? MessageFilterType.GROOVY_SCRIPT
      : MessageFilterType.STRING_CONTAINS
  );
  const [query, setQuery] = React.useState<string>(
    queryType === MessageFilterType.STRING_CONTAINS
      ? searchParams.get('q') || ''
      : ''
  );
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
      return currentSeekType === SeekType.TIMESTAMP && !timestamp;
    }

    return false;
  }, [isSeekTypeControlVisible, currentSeekType, timestamp]);

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
      filterQueryType: queryType,
      attempt,
      limit: PER_PAGE,
      seekDirection,
    };
    if (typeof activeFilter === 'object') {
      props.q = `valueAsText.contains('${activeFilter.code}')`;
      setQueryType(MessageFilterType.GROOVY_SCRIPT);
    }
    if (isSeekTypeControlVisible) {
      props.seekType = currentSeekType;
      props.seekTo = selectedPartitions.map(({ value }) => {
        let seekToOffset;

        if (currentSeekType === SeekType.OFFSET) {
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

  const addFilter = (newFilter: MessageFilters) => {
    const filters = [...savedFilters];
    filters.push(newFilter);
    setSavedFilters(filters);
    localStorage.setItem('savedFilters', JSON.stringify(filters));
  };
  const deleteFilter = (index: number) => {
    const filters = [...savedFilters];
    if (typeof activeFilter === 'object' && activeFilter.index === index) {
      localStorage.removeItem('activeFilter');
      setActiveFilter(false);
    }
    filters.splice(index, 1);
    localStorage.setItem('savedFilters', JSON.stringify(filters));
    setSavedFilters(filters);
  };
  const deleteActiveFilter = () => {
    setActiveFilter(false);
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
    if (
      typeof activeFilter === 'object' &&
      activeFilter.index === filter.index
    ) {
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
    setSavedFilters(filters);
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
    <S.FiltersWrapper>
      <div>
        <S.FilterInputs>
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
            <S.SeekTypeSelectorWrapper>
              <Select
                id="selectSeekType"
                onChange={(option) => setCurrentSeekType(option as SeekType)}
                value={currentSeekType}
                selectSize="M"
                minWidth="100px"
                options={SeekTypeOptions}
              />
              {currentSeekType === SeekType.OFFSET ? (
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
            </S.SeekTypeSelectorWrapper>
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
          <S.ClearAll>Clear all</S.ClearAll>
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
        </S.FilterInputs>
        <Select
          selectSize="M"
          onChange={(option) => toggleSeekDirection(option as string)}
          value={seekDirection}
          minWidth="120px"
          options={SeekDirectionOptions}
        />
      </div>
      <S.AddedFiltersWrapper>
        <S.AddFiltersIcon onClick={toggleIsOpen}>
          <i className="fas fa-plus fa-sm" />
        </S.AddFiltersIcon>
        {typeof activeFilter === 'object' && (
          <S.AddedFilter>
            {activeFilter.name}
            <S.DeleteSavedFilterIcon onClick={deleteActiveFilter}>
              <i className="fas fa-times" />
            </S.DeleteSavedFilterIcon>
          </S.AddedFilter>
        )}
      </S.AddedFiltersWrapper>
      {isOpen && (
        <FilterModal
          toggleIsOpen={toggleIsOpen}
          filters={savedFilters}
          addFilter={addFilter}
          deleteFilter={deleteFilter}
          activeFilterHandler={activeFilterHandler}
          editSavedFilter={editSavedFilter}
        />
      )}
      <S.FiltersMetrics>
        <p style={{ fontSize: 14 }}>{isFetching && phaseMessage}</p>
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
          <span>{messagesConsumed} messages</span>
        </S.Metric>
      </S.FiltersMetrics>
    </S.FiltersWrapper>
  );
};

export default Filters;
