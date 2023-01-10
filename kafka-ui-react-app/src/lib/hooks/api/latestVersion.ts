import { useQuery } from '@tanstack/react-query';
import { actuatorInfoPayload } from 'lib/fixtures/actuatorInfo';
import {
  QUERY_REFETCH_OFF_OPTIONS,
  GIT_REPO_LATEST_RELEASE_LINK,
} from 'lib/constants';

const fetchLatestVersion = async () => {
  const data = await fetch(GIT_REPO_LATEST_RELEASE_LINK)
    .then((res) => res.json())
    .catch(() => actuatorInfoPayload);

  return data;
};

export function useLatestVersion() {
  return useQuery(
    ['latestVersion'],
    fetchLatestVersion,
    QUERY_REFETCH_OFF_OPTIONS
  );
}
