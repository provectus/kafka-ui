import { ConsumingMode } from 'lib/hooks/api/topicMessages';
import { SelectOption } from 'components/common/Select/Select';

interface Mode {
  key: ConsumingMode;
  title: string;
}

interface ModeOption extends SelectOption {
  value: ConsumingMode;
}

const config: Mode[] = [
  {
    key: 'live',
    title: 'Live mode',
  },
  {
    key: 'newest',
    title: 'Newest first',
  },
  {
    key: 'oldest',
    title: 'Oldest first',
  },
  {
    key: 'fromOffset',
    title: 'From offset',
  },
  {
    key: 'toOffset',
    title: 'To offset',
  },
  {
    key: 'sinceTime',
    title: 'Since time',
  },
  {
    key: 'untilTime',
    title: 'Until time',
  },
];

export const getModeOptions = (): ModeOption[] =>
  config.map(({ key, title }) => ({ value: key, label: title }));

export const getModeTitle = (mode: ConsumingMode = 'newest') => {
  const modeConfig = config.find((item) => item.key === mode) as Mode;
  return modeConfig.title;
};
