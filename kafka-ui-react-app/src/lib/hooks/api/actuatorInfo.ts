import { useQuery } from '@tanstack/react-query';
import { BASE_PARAMS, QUERY_REFETCH_OFF_OPTIONS } from 'lib/constants';

const fetchActuatorInfo = async () => {
  const data = await fetch(
    `${BASE_PARAMS.basePath}/actuator/info`,
    BASE_PARAMS
  ).then((res) => res.json());

  return data;
};

export function useActuatorInfo() {
  return useQuery(
    ['actuatorInfo'],
    fetchActuatorInfo,
    QUERY_REFETCH_OFF_OPTIONS
  );
}
