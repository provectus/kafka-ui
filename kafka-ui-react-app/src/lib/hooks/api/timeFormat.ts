import { useQuery } from '@tanstack/react-query';
import { BASE_PARAMS } from 'lib/constants';

const fetchTimeFormat = async () => {
  const data = await fetch('/api/info/timestampformat', BASE_PARAMS).then(
    (res) => res.json()
  );
  return data;
};

export function useTimeFormatStats() {
  return useQuery(['timestampformat'], fetchTimeFormat);
}
