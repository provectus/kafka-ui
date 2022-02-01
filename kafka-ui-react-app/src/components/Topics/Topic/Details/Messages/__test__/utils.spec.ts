import { Option } from 'react-multi-select-component/dist/lib/interfaces';
import {
  filterOptions,
  getOffsetFromSeekToParam,
  getTimestampFromSeekToParam,
  getSelectedPartitionsFromSeekToParam,
} from 'components/Topics/Topic/Details/Messages/Filters/utils';
import { SeekType, Partition } from 'generated-sources';

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

let paramsString;
let searchParams = new URLSearchParams(paramsString);

describe('utils', () => {
  describe('filterOptions', () => {
    it('returns options if no filter is defined', () => {
      expect(filterOptions(options, '')).toEqual(options);
    });

    it('returns filtered options', () => {
      expect(filterOptions(options, '11')).toEqual([options[2]]);
    });
  });

  describe('getOffsetFromSeekToParam', () => {
    beforeEach(() => {
      paramsString = 'seekTo=0::123,1::123,2::0';
      searchParams = new URLSearchParams(paramsString);
    });

    it('returns nothing when seekType is equal BEGGINING', () => {
      searchParams.set('seekType', SeekType.BEGINNING);
      expect(getOffsetFromSeekToParam(searchParams)).toEqual('');
    });

    it('returns nothing when seekType is equal TIMESTAMP', () => {
      searchParams.set('seekType', SeekType.TIMESTAMP);
      expect(getOffsetFromSeekToParam(searchParams)).toEqual('');
    });

    it('returns correct seekTo when seekType is equal OFFSET', () => {
      searchParams.set('seekType', SeekType.OFFSET);
      expect(getOffsetFromSeekToParam(searchParams)).toEqual('123');
    });

    it('returns 0 when seekTo is empty and seekType is equal OFFSET', () => {
      searchParams.set('seekType', SeekType.OFFSET);
      searchParams.delete('seekTo');
      expect(getOffsetFromSeekToParam(searchParams)).toEqual('0');
    });
  });

  describe('getTimestampFromSeekToParam', () => {
    beforeEach(() => {
      paramsString = `seekTo=0::1627333200000,1::1627333200000`;
      searchParams = new URLSearchParams(paramsString);
    });

    it('returns when seekType is equal BEGGINING', () => {
      searchParams.set('seekType', SeekType.BEGINNING);
      expect(getTimestampFromSeekToParam(searchParams)).toEqual(null);
    });
    it('returns when seekType is equal OFFSET', () => {
      searchParams.set('seekType', SeekType.OFFSET);
      expect(getTimestampFromSeekToParam(searchParams)).toEqual(null);
    });
    it('returns when seekType is equal TIMESTAMP', () => {
      searchParams.set('seekType', SeekType.TIMESTAMP);
      expect(getTimestampFromSeekToParam(searchParams)).toEqual(
        new Date(1627333200000)
      );
    });
    it('returns default timestamp when seekTo is empty and seekType is equal TIMESTAMP', () => {
      searchParams.set('seekType', SeekType.TIMESTAMP);
      searchParams.delete('seekTo');
      expect(getTimestampFromSeekToParam(searchParams)).toEqual(new Date(0));
    });
  });

  describe('getSelectedPartitionsFromSeekToParam', () => {
    const part: Partition[] = [{ partition: 42, offsetMin: 0, offsetMax: 100 }];

    it('return when serachParams have seekTo and PartititionId includes selected partition', () => {
      searchParams.set('seekTo', '42::0');
      expect(getSelectedPartitionsFromSeekToParam(searchParams, part)).toEqual([
        { label: '42', value: 42 },
      ]);
    });
    it('return when serachParams have seekTo and PartititionId NOT includes selected partition', () => {
      searchParams.set('seekTo', '24::0');
      expect(getSelectedPartitionsFromSeekToParam(searchParams, part)).toEqual(
        []
      );
    });
    it('return when searchParams not have seekTo', () => {
      searchParams.delete('seekTo');
      expect(getSelectedPartitionsFromSeekToParam(searchParams, part)).toEqual([
        { label: '42', value: 42 },
      ]);
    });
  });
});
