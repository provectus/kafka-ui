import { Option } from 'react-multi-select-component/dist/lib/interfaces';
import { filterOptions } from 'components/Topics/Topic/Details/Messages/Filters/utils';

const options: Option[] = [
  {
    value: 0,
    label: 'Partition #0',
  },
  {
    value: 1,
    label: 'Partition #1',
  },
  {
    value: 11,
    label: 'Partition #11',
  },
  {
    value: 21,
    label: 'Partition #21',
  },
];

describe('utils', () => {
  describe('filterOptions', () => {
    it('returns options if no filter is defined', () => {
      expect(filterOptions(options, '')).toEqual(options);
    });

    it('returns filtered options', () => {
      expect(filterOptions(options, '11')).toEqual([options[2]]);
    });
  });
});
