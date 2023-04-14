import { useQuery } from '@tanstack/react-query';
import { BASE_PARAMS, QUERY_REFETCH_OFF_OPTIONS } from 'lib/constants';

const fetchLatestVersionInfo = async () => {
  const data = await fetch(
    `${BASE_PARAMS.basePath}/api/info`,
    BASE_PARAMS
  ).then((res) => res.json());

  return data;
};

export function useLatestVersion() {
  return useQuery(
    ['versionInfo'],
    fetchLatestVersionInfo,
    QUERY_REFETCH_OFF_OPTIONS
  );
}
