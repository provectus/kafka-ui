import { Partition } from 'generated-sources';
import { ConsumingMode } from 'lib/hooks/api/topicMessages';
import { Option } from 'react-multi-select-component';

export const filterOptions = (options: Option[], filter: string) => {
  if (!filter) {
    return options;
  }
  return options.filter(({ value }) => value && value.toString() === filter);
};

export const convertPartitionsToOptions = (ids: Array<string>): Option[] =>
  ids.map((id) => ({
    label: `Partition #${id}`,
    value: `${id}`,
  }));

export const getSelectedPartitions = (
  allIds: string[],
  query: string | null
) => {
  let selectedIds: string[] = [];
  switch (query) {
    case null: // Empty array of partitions in searchParams - means all
    case 'all':
      selectedIds = allIds;
      break;
    case 'none':
      selectedIds = [];
      break;
    default:
      selectedIds = query.split('.');
      break;
  }
  return convertPartitionsToOptions(selectedIds);
};

type PartionOffsetKey = 'offsetMax' | 'offsetMin';

const generateSeekTo = (
  partitions: Partition[],
  type: 'property' | 'value',
  value: PartionOffsetKey | string
) => {
  // we iterating over existing partitions to avoid sending wrong partition ids to the backend
  const seekTo = partitions.map((partition) => {
    const { partition: id } = partition;
    switch (type) {
      case 'property':
        return `${id}-${partition[value as PartionOffsetKey]}`;
      case 'value':
        return `${id}-${value}`;
      default:
        return null;
    }
  });

  return seekTo.join('.');
};

export const generateSeekToForSelectedPartitions = (
  mode: ConsumingMode,
  partitions: Partition[],
  offset: string,
  time: string
) => {
  switch (mode) {
    case 'live':
    case 'newest':
      return generateSeekTo(partitions, 'property', 'offsetMax');
    case 'fromOffset':
    case 'toOffset':
      return generateSeekTo(partitions, 'value', offset);
    case 'sinceTime':
    case 'untilTime':
      return generateSeekTo(partitions, 'value', time);
    default:
      // case 'oldest';
      return generateSeekTo(partitions, 'value', '0');
  }
};

export const setSeekTo = (
  searchParams: URLSearchParams,
  partitions: Partition[]
) => {
  const currentSeekTo = searchParams.get('seekTo');
  const mode = searchParams.get('m') as ConsumingMode;
  const offset = (searchParams.get('o') as string) || '0';
  const time =
    (searchParams.get('t') as string) || new Date().getTime().toString();

  let selectedPartitions: Partition[] = [];
  // if not `seekTo` property in search params, we set it to all partition
  if (!currentSeekTo) {
    selectedPartitions = partitions;
  } else {
    const partitionIds = currentSeekTo
      .split('.')
      .map((prop) => prop.split('-')[0]);

    selectedPartitions = partitions.filter(({ partition }) =>
      partitionIds.includes(String(partition))
    );
  }
  searchParams.set(
    'seekTo',
    generateSeekToForSelectedPartitions(mode, selectedPartitions, offset, time)
  );

  return searchParams;
};
